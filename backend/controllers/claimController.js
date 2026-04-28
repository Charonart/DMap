const pool = require('../config/db');
const multer = require('multer');
const config = require('../config/appConfig');
const cloudinary = require('../utils/cloudinary');

// Multer memory storage for claim documents
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxDocumentSize },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const mimetypes = /image\/jpeg|image\/png|image\/webp|application\/pdf/;
    if (mimetypes.test(file.mimetype) && allowed.test(file.originalname.toLowerCase())) {
      return cb(null, true);
    }
    cb(new Error('Chỉ cho phép tải lên hình ảnh hoặc PDF!'));
  }
});

exports.uploadClaimDoc = upload.single('document');

// User submits a claim for a POI
exports.submitClaim = async (req, res) => {
  try {
    const poiId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check POI exists
    const poiCheck = await pool.query('SELECT id, owner_user_id FROM pois WHERE id = $1 AND deleted_at IS NULL', [poiId]);
    if (poiCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'POI not found' });
    }
    if (poiCheck.rows[0].owner_user_id) {
      return res.status(400).json({ status: 'error', message: 'POI already claimed by another business' });
    }

    // Check for existing pending claim
    const existing = await pool.query(
      "SELECT id FROM poi_claims WHERE poi_id = $1 AND user_id = $2 AND status = 'pending'",
      [poiId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ status: 'error', message: 'You already have a pending claim for this POI' });
    }

    // Upload document to Cloudinary
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Document (business license/photo) is required' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'dmap_claims',
      public_id: `claim-poi${poiId}-${Date.now()}`
    });

    const { rows } = await pool.query(
      'INSERT INTO poi_claims (poi_id, user_id, document_url, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [poiId, userId, result.secure_url, 'pending']
    );

    res.status(201).json({ status: 'success', message: 'Claim submitted for review', data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Admin: list all pending claims
exports.getClaims = async (req, res) => {
  try {
    const statusFilter = req.query.status || 'pending';
    const { rows } = await pool.query(`
      SELECT pc.*, 
             p.name AS poi_name, p.address AS poi_address,
             u.email AS user_email, u.username AS user_username
      FROM poi_claims pc
      JOIN pois p ON pc.poi_id = p.id
      JOIN users u ON pc.user_id = u.id
      WHERE pc.status = $1
      ORDER BY pc.created_at ASC
    `, [statusFilter]);

    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Admin: approve or reject a claim
exports.reviewClaim = async (req, res) => {
  const client = await pool.connect();
  try {
    const { status, admin_note } = req.body;
    const claimId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Status must be approved or rejected' });
    }

    await client.query('BEGIN');

    const claimCheck = await client.query('SELECT * FROM poi_claims WHERE id = $1', [claimId]);
    if (claimCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Claim not found' });
    }

    const claim = claimCheck.rows[0];

    // Update claim status
    await client.query(
      'UPDATE poi_claims SET status = $1, admin_note = $2 WHERE id = $3',
      [status, admin_note, claimId]
    );

    // If approved, update POI ownership
    if (status === 'approved') {
      await client.query(
        'UPDATE pois SET owner_user_id = $1, is_verified = TRUE WHERE id = $2',
        [claim.user_id, claim.poi_id]
      );
      // Reject other pending claims for the same POI
      await client.query(
        "UPDATE poi_claims SET status = 'rejected', admin_note = 'Another claim was approved' WHERE poi_id = $1 AND id != $2 AND status = 'pending'",
        [claim.poi_id, claimId]
      );
    }

    await client.query('COMMIT');
    res.json({ status: 'success', message: `Claim ${status} successfully` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
};

const pool = require('../config/db');
const multer = require('multer');
const config = require('../config/appConfig');
const cloudinary = require('../utils/cloudinary');

// Fix #8: Switch to Cloudinary upload, matching photoController.js
const storage = multer.memoryStorage();

exports.uploadReviewImage = multer({
    storage,
    limits: { fileSize: config.uploads.maxPhotoSize },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetypes = /image\/jpeg|image\/png|image\/webp/;
        if (mimetypes.test(file.mimetype) && filetypes.test(file.originalname.toLowerCase())) {
            return cb(null, true);
        }
        cb(new Error('Chỉ cho phép tải lên file hình ảnh!'));
    }
}).single('image');

exports.getReviews = async (req, res) => {
  try {
    // Fix #19: Select specific columns, exclude user_id
    // Module 2: Sort by helpful_count first so most useful reviews appear on top
    const poiId = parseInt(req.params.id);
    const userId = req.user ? req.user.id : null;
    const { rows } = await pool.query(`
      SELECT ur.id, ur.poi_id, ur.reviewer_name, ur.rating, ur.comment,
             ur.disability_type, ur.visited_at, ur.created_at,
             ur.helpful_count,
             p.image_url,
             EXISTS(SELECT 1 FROM review_reactions rr WHERE rr.review_id = ur.id AND rr.user_id = $2) as has_voted
      FROM user_reviews ur
      LEFT JOIN poi_photos p ON ur.id = p.review_id
      WHERE ur.poi_id = $1 
      ORDER BY ur.helpful_count DESC, ur.created_at DESC
    `, [poiId, userId]);
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.addReview = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rating, comment, disability_type, visited_at } = req.body;
    const reviewer_name = req.user.username || req.user.email.split('@')[0];
    const user_id = req.user.id;
    const poi_id = parseInt(req.params.id);

    if (!rating || rating < 1 || rating > 10) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'rating (1-10) is required' });
    }

    const reviewResult = await client.query(`
      INSERT INTO user_reviews (poi_id, user_id, reviewer_name, rating, comment, disability_type, visited_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [poi_id, user_id, reviewer_name, rating, comment, disability_type, visited_at]);

    const reviewId = reviewResult.rows[0].id;
    let imageUrl = null;

    // Fix #8: Upload to Cloudinary instead of local disk
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const resultCloudinary = await cloudinary.uploader.upload(dataURI, {
        folder: 'dmap_reviews',
        public_id: `review-${reviewId}-${Date.now()}`
      });
      
      imageUrl = resultCloudinary.secure_url;
      await client.query(`
        INSERT INTO poi_photos (poi_id, user_id, image_url, review_id, is_verified)
        VALUES ($1, $2, $3, $4, $5)
      `, [poi_id, user_id, imageUrl, reviewId, true]);
    }

    await client.query('SELECT recalculate_poi_score($1::integer)', [poi_id]);
    await client.query('COMMIT');
    
    res.status(201).json({ status: 'success', data: { ...reviewResult.rows[0], image_url: imageUrl } });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = parseInt(req.params.review_id);
    const poiId = parseInt(req.params.id);

    const check = await pool.query('SELECT user_id FROM user_reviews WHERE id = $1', [reviewId]);
    if (check.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Review not found' });
    if (String(check.rows[0].user_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const result = await pool.query(`
      UPDATE user_reviews SET
        rating = COALESCE($1, rating),
        comment = COALESCE($2, comment)
      WHERE id = $3 RETURNING *
    `, [rating, comment, reviewId]);

    await pool.query('SELECT recalculate_poi_score($1::integer)', [poiId]);
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.review_id);
    const poiId = parseInt(req.params.id);

    const check = await pool.query('SELECT user_id FROM user_reviews WHERE id = $1', [reviewId]);
    if (check.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Review not found' });
    if (String(check.rows[0].user_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    await pool.query('DELETE FROM user_reviews WHERE id = $1', [reviewId]);
    await pool.query('SELECT recalculate_poi_score($1::integer)', [poiId]);
    res.json({ status: 'success', message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

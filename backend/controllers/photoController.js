const pool = require('../config/db');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');

// Set up multer using memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetypes = /image\/jpeg|image\/png|image\/webp/;
        const extname = filetypes.test(file.originalname.toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Chỉ cho phép tải lên file hình ảnh (JPEG, PNG, WEBP)!'));
    }
});

exports.uploadPhoto = upload.single('image');

exports.handlePhotoUpload = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;
        const reviewId = req.body.review_id || null;

        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'Không tìm thấy file tải lên.' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const resultCloudinary = await cloudinary.uploader.upload(dataURI, {
            folder: 'dmap_pois',
            public_id: `poi-${id}-${Date.now()}`
        });

        const imageUrl = resultCloudinary.secure_url;

        let result;
        if (reviewId) {
            result = await pool.query(
                `INSERT INTO poi_photos (poi_id, user_id, review_id, image_url, is_verified)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [id, userId, reviewId, imageUrl, false]
            );
        } else {
            result = await pool.query(
                `INSERT INTO poi_photos (poi_id, user_id, image_url, is_verified)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [id, userId, imageUrl, false]
            );
        }

        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ status: 'error', message: 'Lỗi server khi tải ảnh lên.' });
    }
};

exports.getPhotosByPoi = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await pool.query(
            `SELECT p.id, p.poi_id, p.image_url, p.review_id, p.is_verified, p.uploaded_at,
                    u.username
             FROM poi_photos p
             LEFT JOIN users u ON p.user_id = u.id
             WHERE p.poi_id = $1
             ORDER BY p.uploaded_at DESC`,
            [id]
        );
        res.json({ status: 'success', data: result.rows });
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ status: 'error', message: 'Lỗi server khi lấy hình ảnh.' });
    }
};

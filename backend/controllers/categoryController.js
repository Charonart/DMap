const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name_vi');
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

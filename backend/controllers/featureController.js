const pool = require('../config/db');

exports.getFeatures = async (req, res) => {
  try {
    const { group } = req.query;
    let query = 'SELECT * FROM accessibility_features';
    const params = [];

    if (group) {
      query += ' WHERE feature_group = $1';
      params.push(group);
    }

    query += ' ORDER BY feature_group, name_vi';
    const { rows } = await pool.query(query, params);
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

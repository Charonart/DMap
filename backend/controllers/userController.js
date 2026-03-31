const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, username, role, status, created_at, trust_score FROM users WHERE id = $1 AND deleted_at IS NULL', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: rows[0] });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check old password if updating password
      if (newPassword) {
        if (!oldPassword) {
          await client.query('ROLLBACK');
          return res.status(400).json({ status: 'error', message: 'oldPassword is required to set a new password' });
        }
        const userCheck = await client.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const valid = await bcrypt.compare(oldPassword, userCheck.rows[0].password_hash);
        if (!valid) {
          await client.query('ROLLBACK');
          return res.status(400).json({ status: 'error', message: 'Incorrect old password' });
        }
        
        const hash = await bcrypt.hash(newPassword, 10);
        await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
      }

      if (username !== undefined) {
        await client.query('UPDATE users SET username = $1 WHERE id = $2', [username, req.user.id]);
      }

      await client.query('COMMIT');
      res.json({ status: 'success', message: 'Profile updated' });
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(400).json({ status: 'error', message: err.message });
    } finally {
      client.release();
    }
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.getContributions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    
    const pois = await pool.query(
      'SELECT id, name, name_vi, address, overall_score, status, created_at FROM pois WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    const reviews = await pool.query(
      'SELECT id, poi_id, rating, comment, created_at FROM user_reviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    res.json({
      status: 'success',
      data: {
        pois: pois.rows,
        reviews: reviews.rows
      }
    });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.getSavedCollections = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        ub.collection_name,
        json_agg(
          json_build_object(
            'poi_id', p.id,
            'name', p.name,
            'address', p.address,
            'category_icon', c.icon,
            'overall_score', p.overall_score
          )
        ) as pois
      FROM user_bookmarks ub
      JOIN pois p ON ub.poi_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ub.user_id = $1 AND p.deleted_at IS NULL
      GROUP BY ub.collection_name
      ORDER BY ub.collection_name
    `, [req.user.id]);

    const result = {};
    rows.forEach(row => {
      result[row.collection_name] = row.pois;
    });

    res.json({ status: 'success', data: result });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

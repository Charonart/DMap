const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Fix #15: Role checks removed from controllers — handled by requireAdmin/requireAdminOrMod middleware in routes

exports.getStats = async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL');
    const poiCount = await pool.query('SELECT COUNT(*) FROM pois WHERE deleted_at IS NULL');
    const pendingCount = await pool.query("SELECT COUNT(*) FROM pois WHERE status = 'pending' AND deleted_at IS NULL");
    const flagCount = await pool.query('SELECT COUNT(*) FROM pois WHERE flag_count > 0 AND deleted_at IS NULL');
    res.json({
      status: 'success',
      data: {
        totalUsers: parseInt(userCount.rows[0].count),
        totalPois: parseInt(poiCount.rows[0].count),
        pendingPois: parseInt(pendingCount.rows[0].count),
        flaggedPois: parseInt(flagCount.rows[0].count)
      }
    });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.getUsers = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const { rows } = await pool.query(
      'SELECT id, email, username, role, status, created_at, trust_score FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ status: 'success', data: rows, pagination: { limit, offset } });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

// Fix #20: Validate input for createUser
exports.createUser = async (req, res) => {
  try {
    const { email, password, role, status, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
    }
    const validRoles = ['user', 'moderator', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ status: 'error', message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const hash = await bcrypt.hash(password, 10);
    const signupUsername = username || email.split('@')[0];
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, username, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username, role, status',
      [email, hash, signupUsername, role || 'user', status || 'active']
    );
    res.status(201).json({ status: 'success', data: rows[0] });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, status, trust_score } = req.body;
    const { rows } = await pool.query(
      'UPDATE users SET role = COALESCE($1, role), status = COALESCE($2, status), trust_score = COALESCE($3, trust_score) WHERE id = $4 AND deleted_at IS NULL RETURNING id, email, username, role, status, trust_score',
      [role, status, trust_score, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: rows[0] });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

// Fix #5: Soft Delete instead of Hard Delete
exports.deleteUser = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, status = $1 WHERE id = $2 AND deleted_at IS NULL',
      ['banned', req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', message: 'User soft-deleted' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.banUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body; // 'banned' or 'active'
    if (!['active', 'banned'].includes(status)) return res.status(400).json({ status: 'error', message: 'Invalid status' });
    const { rowCount } = await pool.query('UPDATE users SET status = $1 WHERE id = $2 AND deleted_at IS NULL', [status, userId]);
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', message: `User status updated to ${status}` });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.getPendingPois = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM pois WHERE status = 'pending' AND deleted_at IS NULL ORDER BY created_at ASC");
    res.json({ status: 'success', data: rows });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.reviewPoi = async (req, res) => {
  try {
    const { status, note } = req.body; // 'approved' or 'rejected'
    const poiId = parseInt(req.params.id);
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ status: 'error', message: 'Invalid status' });
    const { rowCount } = await pool.query(
      'UPDATE pois SET status = $1, note = $2 WHERE id = $3 AND deleted_at IS NULL',
      [status, note, poiId]
    );
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'POI not found' });
    await pool.query('SELECT recalculate_poi_score($1::integer)', [poiId]);
    res.json({ status: 'success', message: `POI ${status} successfully` });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.getEditHistory = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const { rows } = await pool.query('SELECT * FROM edit_history ORDER BY edited_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ status: 'success', data: rows, pagination: { limit, offset } });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.getFlaggedPois = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.flag_count, p.is_hidden, 
             json_agg(json_build_object('reason', pf.reason, 'user_id', pf.user_id)) AS flags
      FROM pois p
      JOIN poi_flags pf ON p.id = pf.poi_id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.name, p.flag_count, p.is_hidden
      ORDER BY p.flag_count DESC
    `);
    res.json({ status: 'success', data: rows });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

exports.resolveFlag = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const poiId = req.params.id;
    await client.query('DELETE FROM poi_flags WHERE poi_id = $1', [poiId]);
    await client.query('UPDATE pois SET flag_count = 0, is_hidden = FALSE WHERE id = $1', [poiId]);
    await client.query('COMMIT');
    res.json({ status: 'success', message: 'POI flags cleared, POI restored' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: err.message });
  } finally { client.release(); }
};

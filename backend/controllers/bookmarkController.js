const pool = require('../config/db');

exports.savePoi = async (req, res) => {
  const client = await pool.connect();
  try {
    const poiId = parseInt(req.params.id);
    const userId = req.user.id;
    const collectionName = req.body.collection_name || 'Yêu thích';

    await client.query('BEGIN');
    
    // Check if POI exists
    const poiCheck = await client.query('SELECT id FROM pois WHERE id = $1 AND deleted_at IS NULL', [poiId]);
    if (poiCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'POI not found' });
    }

    const { rows } = await client.query(`
      INSERT INTO user_bookmarks (user_id, poi_id, collection_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, poi_id, collection_name) DO NOTHING
      RETURNING *
    `, [userId, poiId, collectionName]);

    await client.query('COMMIT');
    
    if (rows.length === 0) {
      return res.status(409).json({ status: 'error', message: `POI already saved in ${collectionName}` });
    }

    res.status(201).json({ status: 'success', message: 'POI saved successfully', data: rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
};

// Fix #21: Read collection_name from req.query instead of req.body (DELETE body is non-standard)
exports.unsavePoi = async (req, res) => {
  try {
    const poiId = parseInt(req.params.id);
    const userId = req.user.id;
    const collectionName = req.query.collection_name;

    let query = 'DELETE FROM user_bookmarks WHERE user_id = $1 AND poi_id = $2';
    const params = [userId, poiId];

    if (collectionName) {
      query += ' AND collection_name = $3';
      params.push(collectionName);
    }

    const { rowCount } = await pool.query(query, params);
    
    if (rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Bookmark not found' });
    }

    res.json({ status: 'success', message: 'POI unsaved successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

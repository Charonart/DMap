const pool = require('../config/db');
const config = require('../config/appConfig');

// Module 4: Fast trigram autocomplete search
exports.autocomplete = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ status: 'success', data: [] });
    }

    const searchTerm = q.trim();

    // Use pg_trgm similarity for fuzzy matching, limited results
    const { rows } = await pool.query(`
      SELECT 
        p.id, p.name, p.name_vi, p.address,
        c.name AS category_name, c.icon AS category_icon,
        p.overall_score,
        GREATEST(
          similarity(p.name, $1),
          similarity(COALESCE(p.name_vi, ''), $1),
          similarity(COALESCE(p.address, ''), $1)
        ) AS similarity
      FROM pois p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL 
        AND p.status = 'approved'
        AND p.is_hidden = FALSE
        AND (
          p.name ILIKE $2
          OR p.name_vi ILIKE $2
          OR p.address ILIKE $2
          OR similarity(p.name, $1) > 0.1
          OR similarity(COALESCE(p.name_vi, ''), $1) > 0.1
        )
      ORDER BY similarity DESC
      LIMIT ${config.search.maxFuzzyResults}
    `, [searchTerm, `%${searchTerm}%`]);

    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

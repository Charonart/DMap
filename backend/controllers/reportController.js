const pool = require('../config/db');

// Module 5: Report an inappropriate review
exports.reportReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.review_id;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ status: 'error', message: 'Reason is required (min 5 characters)' });
    }

    // Check review exists
    const reviewCheck = await pool.query('SELECT id, user_id FROM user_reviews WHERE id = $1', [reviewId]);
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }

    // Prevent self-reporting
    if (String(reviewCheck.rows[0].user_id) === String(userId)) {
      return res.status(400).json({ status: 'error', message: 'Cannot report your own review' });
    }

    // Insert report (unique constraint handles duplicates)
    const { rows } = await pool.query(
      'INSERT INTO review_reports (review_id, user_id, reason) VALUES ($1, $2, $3) RETURNING *',
      [reviewId, userId, reason.trim()]
    );

    res.status(201).json({ status: 'success', message: 'Review reported', data: rows[0] });
  } catch (err) {
    // Handle unique constraint violation
    if (err.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'You have already reported this review' });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Module 5: Community leaderboard — top 50 contributors
exports.getLeaderboard = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id, u.username, u.trust_score, u.created_at,
        COUNT(DISTINCT p.id) AS poi_count,
        COUNT(DISTINCT r.id) AS review_count,
        (COUNT(DISTINCT p.id) + COUNT(DISTINCT r.id)) AS total_contributions
      FROM users u
      LEFT JOIN pois p ON u.id = p.user_id AND p.deleted_at IS NULL AND p.status = 'approved'
      LEFT JOIN user_reviews r ON u.id = r.user_id
      WHERE u.deleted_at IS NULL AND u.status = 'active'
      GROUP BY u.id, u.username, u.trust_score, u.created_at
      HAVING (COUNT(DISTINCT p.id) + COUNT(DISTINCT r.id)) > 0
      ORDER BY u.trust_score DESC, total_contributions DESC
      LIMIT 50
    `);

    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Admin: list review reports
exports.getReviewReports = async (req, res) => {
  try {
    const statusFilter = req.query.status || 'pending';
    const { rows } = await pool.query(`
      SELECT rr.*, 
             ur.rating AS review_rating, ur.comment AS review_comment, ur.reviewer_name,
             u.username AS reporter_username
      FROM review_reports rr
      JOIN user_reviews ur ON rr.review_id = ur.id
      LEFT JOIN users u ON rr.user_id = u.id
      WHERE rr.status = $1
      ORDER BY rr.created_at ASC
    `, [statusFilter]);

    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Admin: resolve a review report
exports.resolveReport = async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' or 'dismissed'
    const reportId = req.params.id;

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Status must be resolved or dismissed' });
    }

    const { rowCount } = await pool.query(
      'UPDATE review_reports SET status = $1 WHERE id = $2',
      [status, reportId]
    );
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'Report not found' });

    // If resolved, optionally delete the offending review
    if (status === 'resolved' && req.body.delete_review) {
      const report = await pool.query('SELECT review_id FROM review_reports WHERE id = $1', [reportId]);
      if (report.rows.length > 0) {
        await pool.query('DELETE FROM user_reviews WHERE id = $1', [report.rows[0].review_id]);
      }
    }

    res.json({ status: 'success', message: `Report ${status}` });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const pool = require('../config/db');

// Toggle helpful vote on a review
exports.toggleHelpful = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const reviewId = parseInt(req.params.review_id);
    const poiId = parseInt(req.params.id);

    await client.query('BEGIN');

    // Verify review exists and belongs to this POI
    const reviewCheck = await client.query(
      'SELECT id, user_id FROM user_reviews WHERE id = $1 AND poi_id = $2',
      [reviewId, poiId]
    );
    if (reviewCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }

    // Prevent self-voting
    if (String(reviewCheck.rows[0].user_id) === String(userId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'Cannot vote on your own review' });
    }

    // Check if already voted
    const existing = await client.query(
      'SELECT user_id FROM review_reactions WHERE user_id = $1 AND review_id = $2',
      [userId, reviewId]
    );

    let action;
    if (existing.rows.length > 0) {
      // Remove vote
      await client.query(
        'DELETE FROM review_reactions WHERE user_id = $1 AND review_id = $2',
        [userId, reviewId]
      );
      await client.query(
        'UPDATE user_reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = $1',
        [reviewId]
      );
      action = 'removed';
    } else {
      // Add vote
      await client.query(
        'INSERT INTO review_reactions (user_id, review_id, reaction_type) VALUES ($1, $2, $3)',
        [userId, reviewId, 'helpful']
      );
      await client.query(
        'UPDATE user_reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
        [reviewId]
      );
      action = 'added';
    }

    const updated = await client.query(
      'SELECT helpful_count FROM user_reviews WHERE id = $1',
      [reviewId]
    );

    await client.query('COMMIT');
    res.json({
      status: 'success',
      message: `Helpful vote ${action}`,
      data: { helpful_count: updated.rows[0].helpful_count, action }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
};

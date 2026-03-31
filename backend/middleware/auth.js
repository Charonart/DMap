const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Fix #1: Crash immediately if JWT secrets are missing
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET && JWT_SECRET + '_refresh');

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET is not defined in environment variables. Server cannot start.');
}

// Fix #3: requireAuth now assigns req.user from DB, not stale JWT payload
const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, email, username, role, status, trust_score FROM users WHERE id = $1',
      [decoded.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: User not found' });
    }
    if (rows[0].status === 'banned') {
      return res.status(403).json({ status: 'error', message: 'Forbidden: Account is banned' });
    }
    req.user = rows[0]; // Fresh data from DB, not stale JWT payload
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token' });
  }
};

// Fix #2: optionalAuth now checks banned status from DB
const optionalAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, email, username, role, status, trust_score FROM users WHERE id = $1',
      [decoded.id]
    );
    if (rows.length > 0 && rows[0].status !== 'banned') {
      req.user = rows[0]; // Fresh data from DB
    }
    // If banned or not found, proceed as anonymous (no req.user)
    next();
  } catch (err) {
    next(); // Invalid token → proceed as anonymous
  }
};

// Fix #15: Reusable role-based middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: `Forbidden: Requires ${roles.join(' or ')} role` });
    }
    next();
  };
};

const requireAdmin = requireRole('admin');
const requireAdminOrMod = requireRole('admin', 'moderator');

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireAdminOrMod,
  JWT_SECRET,
  REFRESH_SECRET
};

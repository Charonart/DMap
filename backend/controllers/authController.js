const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, REFRESH_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = '1h'; // Short-lived Access Token
const REFRESH_EXPIRES_IN = '7d';

exports.register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'error', message: 'Email and password required' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ status: 'error', message: 'Email already registered' });

    const signupUsername = username || email.split('@')[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, role, status',
      [email, hashedPassword, signupUsername]
    );

    const user = result.rows[0];

    // Fix #4: Access Token uses JWT_SECRET, Refresh Token uses REFRESH_SECRET
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'error', message: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (result.rows.length === 0) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const user = result.rows[0];
    if (user.status === 'banned') return res.status(403).json({ status: 'error', message: 'Account is banned' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    // Fix #4: Separate secrets for access and refresh tokens
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ status: 'success', data: { user: { id: user.id, email: user.email, username: user.username, role: user.role, status: user.status } } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refresh_token');
  res.json({ status: 'success', message: 'Logged out' });
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ status: 'error', message: 'No refresh token' });
  try {
    // Fix #4: Verify refresh token with REFRESH_SECRET
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const { rows } = await pool.query('SELECT id, email, username, role, status FROM users WHERE id = $1 AND deleted_at IS NULL', [decoded.id]);
    if (rows.length === 0 || rows[0].status === 'banned') return res.status(403).json({ status: 'error', message: 'Invalid user or banned' });
    
    const user = rows[0];
    const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.cookie('token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 1000 });
    res.json({ status: 'success', message: 'Token refreshed' });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
  }
};

exports.me = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ status: 'success', data: { user: null } });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query('SELECT id, email, username, role, status, trust_score FROM users WHERE id = $1 AND deleted_at IS NULL', [decoded.id]);
    if (rows.length === 0) return res.json({ status: 'success', data: { user: null } });
    res.json({ status: 'success', data: { user: rows[0] } });
  } catch (err) {
    res.json({ status: 'success', data: { user: null } });
  }
};

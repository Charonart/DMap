// ============================================
// DMap Backend - Express.js API Server
// 1-10 Accessibility Scoring System
// ============================================
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./config/db');
const { optionalAuth } = require('./middleware/auth');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const featureRoutes = require('./routes/featureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const poiRoutes = require('./routes/poiRoutes');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const searchRoutes = require('./routes/searchRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const claimRoutes = require('./routes/claimRoutes');
const reportRoutes = require('./routes/reportRoutes');
const poiController = require('./controllers/poiController');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving images to frontend
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(cors({ origin: true, credentials: true }));

// Fix #6: Body parsers MUST come BEFORE any middleware that reads req.body
app.use(express.json());
app.use(cookieParser());

// Fix #6: Anti-Exploit middleware NOW runs AFTER express.json() parses body
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && 'id' in req.body) {
    delete req.body.id;
  }
  next();
});

// Fix #22: Removed deprecated xss-clean package — use helmet CSP instead

// ── Rate Limiting ────────────────────────────
const rootLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { status: 'error', message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' }});
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { status: 'error', message: 'Quá nhiều yêu cầu xác thực.' }});

// ── Health Check ───────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// MOUNT ROUTES
// ============================================
app.use('/api', rootLimiter); // Apply general rate limit to all /api
app.use('/api/auth', authLimiter, authRoutes); // Stricter limit on auth
app.use('/api/categories', categoryRoutes);
app.use('/api/accessibility-features', featureRoutes);

// Handled globally to maintain exact path /api/pois.geojson
app.get('/api/pois.geojson', optionalAuth, poiController.getPoiGeoJson);
app.use('/api/pois', poiRoutes);
app.use('/api/pois', photoRoutes);
app.use('/api/pois', bookmarkRoutes);

// Module 2: Review reactions (nested under POI reviews)
app.use('/api/pois/:id/reviews', reactionRoutes);
// Module 3: Business claiming
app.use('/api/pois/:id/claim', claimRoutes);
// Module 4: Autocomplete search
app.use('/api/search', searchRoutes);
// Module 5: Review reports
app.use('/api/reviews', reportRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// ── Start Server ───────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🗺️  DMap API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 GeoJSON: http://localhost:${PORT}/api/pois.geojson`);
});

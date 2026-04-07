const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'quy_admin',
  password: process.env.DB_PASSWORD || 'dmap_secure_2026',
  database: process.env.DB_NAME || 'disability_map',
});

module.exports = pool;

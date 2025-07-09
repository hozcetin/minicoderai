const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'minicoderai',
  password: '54325432',
  port: 5432,
});

module.exports = pool; 
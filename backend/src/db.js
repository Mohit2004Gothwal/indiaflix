const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,   // postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
  ssl: { rejectUnauthorized: false },
});
module.exports = pool;
const pool = require("./db");

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS plans_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      price INTEGER NOT NULL CHECK (price >= 0),
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      billing_period VARCHAR(20) NOT NULL DEFAULT 'Monthly',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS feature_table (
      id SERIAL PRIMARY KEY,
      feature_name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS plan_features (
      plan_id INTEGER NOT NULL
        REFERENCES plans_table(id) ON DELETE CASCADE,
      feature_id INTEGER NOT NULL
        REFERENCES feature_table(id) ON DELETE RESTRICT,
      feature_value VARCHAR(255) NOT NULL,
      PRIMARY KEY (plan_id, feature_id)
    );
  `);

  console.log("Database tables initialized");
}

module.exports = initializeDatabase;
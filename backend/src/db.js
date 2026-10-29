const { Pool } = require('pg');
const dotenv = require('dotenv');
require('dotenv').config();
const pool = new Pool({
    connectionString: process.env.Database_URL,
    ssl:{
        rejectUnauthorized: false
    }
});

module.exports = pool;
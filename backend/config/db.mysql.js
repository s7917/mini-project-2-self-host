// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: process.env.MYSQL_HOST,
//   port: parseInt(process.env.MYSQL_PORT) || 3306,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// pool.getConnection()
//   .then(conn => {
//     console.log('✅ MySQL connected successfully');
//     conn.release();
//   })
//   .catch(err => {
//     console.error('❌ MySQL connection failed:', err.message);
//   });

// module.exports = pool;

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '0.0.0.0',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'dummy',
  password: process.env.MYSQL_PASSWORD || 'dummy',
  database: process.env.MYSQL_DATABASE || 'edtech_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection (but do NOT crash app)
async function testMySQLConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.log('⚠️ Server will continue without MySQL');
  }
}

testMySQLConnection();

module.exports = pool;
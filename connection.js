const mysql = require("mysql2");
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "warner13",
  database: process.env.DB_DATABASE || "employees",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = connection;



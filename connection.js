 const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "warner13",
  database: process.env.DB_DATABASE || "employees",
});

connection.connect(function (err) {
  if (err) throw err;
});

module.exports = connection;



// Export the pool for use in other modules
module.exports = connection;



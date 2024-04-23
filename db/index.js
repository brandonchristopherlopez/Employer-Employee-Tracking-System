const connection = require("./connection");

class Database {
  
  constructor(conn) {
    this.conn = conn;
  }

  // This fetch function allows users to find roles, departments, salaries, and managers
  fetchAllEmployees() {
    const query = `
      SELECT 
        employee.id, 
        employee.first_name, 
        employee.last_name, 
        role.title, 
        department.name AS department, 
        role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
      FROM 
        employee
      LEFT JOIN 
        role ON employee.role_id = role.id
      LEFT JOIN 
        department ON role.department_id = department.id
      LEFT JOIN 
        employee manager ON manager.id = employee.manager_id;
    `;
    return this.connection.promise().query(query);
  }


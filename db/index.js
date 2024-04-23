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

  // Retrieve all employees except the given ID
  fetchPossibleManagers(ID) {
    const query = `
      SELECT 
        id, 
        first_name, 
        last_name 
      FROM 
        employee 
      WHERE 
        id != ?;
    `;
    return this.connection.promise().query(query, [ID]);
  }

  // For Employers use to add new employee into database
  addEmployee(ID) {
    return this.connection.promise().query("INSERT INTO employee SET ?", ID);
  }

   // if an employee is terminated, resigns, etc. Use to delete employee
   deleteEmployee(ID) {
    return this.connection.promise().query(
      "DELETE FROM employee WHERE id = ?",
      ID
    );
  }

  // Update role of an employee
  modifyEmployeeRole(ID, roleID) {
    return this.connection.promise().query("UPDATE employee SET role_id = ? WHERE id = ?", [roleID, ID]);
  }



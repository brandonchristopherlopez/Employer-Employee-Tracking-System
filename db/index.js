const connection = require("./connection");

class Database {
  
  constructor(conn) {
    this.conn = conn;
  }

  // Allows you to find roles, departments, salaries, and managers
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

  // Update the manager of an ID
  modifyEmployeeManager(ID, managerID) {
    return this.connection.promise().query("UPDATE employee SET manager_id = ? WHERE id = ?", [managerID, ID]);
  }
  // Find Roles + Department names
  fetchAllRoles() {
    const query = `
      SELECT 
        role.id, 
        role.title, 
        department.name AS department, 
        role.salary 
      FROM 
        role
      LEFT JOIN 
        department ON role.department_id = department.id;
    `;
    return this.connection.promise().query(query);
  }


  // Add new role to the DB
  addRole(Role) {
    return this.connection.promise().query("INSERT INTO role SET ?", Role);
  }

  // Delete given role from DB 
  deleteRole(ID) {
    return this.connection.promise().query("DELETE FROM role WHERE id = ?", [ID]);
  }
  // Retrieve all departments
  fetchAllDepartments() {
    return this.connection.promise().query("SELECT id, name FROM department;");
  }

  // Retrieve budgets for all departments by summing all budgets
  fetchDepartmentBudgets() {
    const query = `
      SELECT 
        department.id, 
        department.name, 
        SUM(role.salary) AS utilized_budget 
      FROM 
        employee
      LEFT JOIN 
        role ON employee.role_id = role.id
      LEFT JOIN 
        department ON role.department_id = department.id
      GROUP BY 
        department.id, 
        department.name;
    `;
    return this.connection.promise().query(query);
  }

  // Add a new department to the DB
  addDepartment(department) {
    return this.connection.promise().query("INSERT INTO department SET ?", department);
  }
  // Remove a department from the database by ID
  deleteDepartment(ID) {
    return this.connection.promise().query("DELETE FROM department WHERE id = ?", [ID]);
  }

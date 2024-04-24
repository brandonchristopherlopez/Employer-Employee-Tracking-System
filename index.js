const db = require("./db");
const logo = require("asciiart-logo");
const { prompt } = require("inquirer");

startApp();

  // Function to initialize the application
function startApp() {
    const appName = "Employee Manager";
    const appLogo = logo({ name: appName }).render();

    console.log(appLogo);

    promptUser();
}

  // View all employees
function viewEmployees() {
    db.findAllEmployees()
      .then(([rows]) => {
        let employees = rows;
        console.log("\n");
        console.table(employees);
      })
      .then(() => loadMainPrompts());
  }
  

  // Function to display all employees
function displayAllEmployees() {
    db.getAllEmployees()
        .then((result) => {
            const employees = result[0];
            console.log("\n");
            console.table(employees);
        })
        .then(() => promptUserForNextAction());
}
// Function to display employees by department
function displayEmployeesByDepartment() {
    db.getDepartments()
        .then((result) => {
            const departments = result[0];
            const departmentOptions = departments.map((department) => ({
                name: department.name,
                value: department.id
            }));

        });
}

// Asks user for department selection and display employees
function promptAndDisplayEmployeesByDepartment() {
    const departmentOptions = getDepartmentOptions(); 

    prompt([
        {
            type: "list",
            name: "selectedDepartment",
            message: "Select a department to view its employees:",
            choices: departmentOptions
        }
    ])
    .then((response) => {
        const departmentId = response.selectedDepartment;
        return db.getEmployeesByDepartment(departmentId);
    })
    .then((result) => {
        const employees = result[0];
        console.log("\n");
        console.table(employees);
    })
    .then(() => promptUserForNextAction()); 
}
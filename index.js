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

  // View all employees**** needed help on this one 
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
// View all employees reporting tro a specific manager 
function viewEmployeesReportingToManager() {
    // Fetches all employees from  DB
    db.getAllEmployees()
        .then((result) => {
            const managers = result[0];

            // Prompt the list of managers
            const managerOptions = managers.map(manager => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            }));

            // Allow user to select a manager
            return prompt([
                {
                    type: "list",
                    name: "selectedManager",
                    message: "Select a manager to see direct reports:",
                    choices: managerOptions
                }
            ]);
        })
        .then((response) => {
            // Find reports of the selected manager
            return db.getEmployeesByManager(response.selectedManager);
        })
        .then((result) => {
            const employees = result[0];

            // Display the employees who report to the selected manager
            console.log("\n");
            if (employees.length === 0) {
                console.log("The selected manager has no direct reports.");
            } else {
                console.table(employees);
            }
        })
        .then(() => promptUserForNextAction());
}
// Remove employee from DB
function deleteEmployee() {
    // Find all employees from db
    db.getAllEmployees()
        .then((result) => {
            const employees = result[0];

            // Prompt users with employee selections
            const employeeOptions = employees.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }));

            // Select a employee to remove
            return prompt([
                {
                    type: "list",
                    name: "selectedEmployeeId",
                    message: "Select an employee to remove from the database:",
                    choices: employeeOptions
                }
            ]);
        })
        .then((response) => {
            const employeeId = response.selectedEmployeeId;

            // REMOVED!
            return db.deleteEmployeeById(employeeId);
        })
        .then(() => {
            console.log("Employee has been successfully removed from the database.");
        })
        .then(() => promptUserForNextAction()); 
}

//NEXT


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
// Function to update an employee's role
function updateEmployeeRole() {
    // Fetch all employees
    db.findAllEmployees()
        .then(processEmployeeChoices)
        .then(promptForEmployeeId)
        .then(promptForRoleId)
        .then(updateEmployeeRoleInDatabase)
        .then(notifySuccess)
        .then(loadMainPrompts)
        .catch(handleError);
}

// Function to process employees and create employee choices
function processEmployeeChoices([rows]) {
    let employees = rows;
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    return employeeChoices;
}

// Function to prompt user to select an employee
function promptForEmployeeId(employeeChoices) {
    return prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee's role do you want to update?",
            choices: employeeChoices
        }
    ]);
}

// Function to prompt user to select a role
function promptForRoleId({ employeeId }) {
    // Fetch all roles
    return db.findAllRoles()
        .then(([rows]) => {
            const roleChoices = rows.map(({ id, title }) => ({
                name: title,
                value: id
            }));

            return prompt([
                {
                    type: "list",
                    name: "roleId",
                    message: "Which role do you want to assign the selected employee?",
                    choices: roleChoices
                }
            ]).then(({ roleId }) => ({ employeeId, roleId }));
        });
}

// Function to update an employee's role in the database
function updateEmployeeRoleInDatabase({ employeeId, roleId }) {
    return db.updateEmployeeRole(employeeId, roleId);
}

// Function to notify user of successful role update
function notifySuccess() {
    console.log("Updated employee's role");
}

// Function to handle errors during the process
function handleError(error) {
    console.error("An error occurred:", error);
}

// Call the function when you want to update an employee's role
// updateEmployeeRole();

// Function to update an employee's manager
function updateEmployeeManager() {
    db.findAllEmployees()
        .then(processEmployeeChoices)
        .then(promptForEmployeeId)
        .then(promptForManagerId)
        .then(updateManagerInDatabase)
        .then(notifySuccess)
        .then(loadMainPrompts)
        .catch(handleError);
}

// Function to process employees and create choices for prompt
function processEmployeeChoices([rows]) {
    let employees = rows;
    return employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
}

// Function to prompt user to select an employee
function promptForEmployeeId(employeeChoices) {
    return prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee's manager do you want to update?",
            choices: employeeChoices
        }
    ]);
}

// Function to prompt user to select a manager for the chosen employee
function promptForManagerId({ employeeId }) {
    // Fetch possible managers for the selected employee
    return db.findAllPossibleManagers(employeeId)
        .then(([rows]) => {
            const managerChoices = rows.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            return prompt([
                {
                    type: "list",
                    name: "managerId",
                    message: "Who should be the new manager for the selected employee?",
                    choices: managerChoices
                }
            ]).then(({ managerId }) => ({ employeeId, managerId }));
        });
}

// Function to update the manager in the database
function updateManagerInDatabase({ employeeId, managerId }) {
    return db.updateEmployeeManager(employeeId, managerId);
}

// Function to notify the user of a successful update
function notifySuccess() {
    console.log("Updated employee's manager successfully.");
}

// Function to handle errors during the process
function handleError(error) {
    console.error("An error occurred during the process:", error);
}
// Function to view all roles
function viewRoles() {
    // Fetch all roles from the database
    db.findAllRoles()
        .then(displayRoles)
        .then(loadMainPrompts)
        .catch(handleError);
}

// Function to display roles in a table format
function displayRoles([rows]) {
    console.log("\n");
    console.table(rows);
}

// Function to handle errors during the process
function handleError(error) {
    console.error("An error occurred while retrieving roles:", error);
}

// Export functions or call the function to view roles as needed
// viewRoles();

// Function to add a new role
function addRole() {
    // Fetch all departments to provide choices for the prompt
    db.findAllDepartments()
        .then(processDepartmentChoices)
        .then(promptForRoleDetails)
        .then(addRoleToDatabase)
        .then(notifySuccess)
        .then(loadMainPrompts)
        .catch(handleError);
}

// Function to process departments and create choices for prompt
function processDepartmentChoices([rows]) {
    let departments = rows;
    return departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
}

// Function to prompt the user for the details of the new role
function promptForRoleDetails(departmentChoices) {
    return prompt([
        {
            name: "title",
            message: "What is the name of the role?"
        },
        {
            name: "salary",
            message: "What is the salary of the role?"
        },
        {
            type: "list",
            name: "department_id",
            message: "Which department does the role belong to?",
            choices: departmentChoices
        }
    ]);
}

// Function to add the new role to the database
function addRoleToDatabase(roleDetails) {
    return db.createRole(roleDetails);
}

// Function to notify the user of a successful role addition
function notifySuccess(roleDetails) {
    console.log(`Added ${roleDetails.title} to the database`);
}

// Function to handle errors during the process
function handleError(error) {
    console.error("An error occurred while adding the role:", error);
}

// Export functions or call the function to add a new role as needed
// addRole();

const db = require("./db");
const logo = require("asciiart-logo");
const { prompt } = require("inquirer");

startApp();

function startApp() {
    const appName = "Employee Manager";
    const appLogo = logo({ name: appName }).render();

    console.log(appLogo);

    promptUser();
}

function fetchAllEmployees() {
    db.fetchAllEmployees()
      .then(([rows]) => {
        let employees = rows;
        console.table(employees);
      })
      .then(() => loadMainPrompts());
}

function displayAllEmployees() {
    db.getAllEmployees()
        .then((result) => {
            const employees = result[0];
            console.log("\n");
            console.table(employees);
        })
        .then(() => promptUserForNextAction());
}
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
function viewEmployeesReportingToManager() {
    db.getAllEmployees()
        .then((result) => {
            const managers = result[0];

            const managerOptions = managers.map(manager => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            }));

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
            return db.getEmployeesByManager(response.selectedManager);
        })
        .then((result) => {
            const employees = result[0];

            console.log("\n");
            if (employees.length === 0) {
                console.log("The selected manager has no direct reports.");
            } else {
                console.table(employees);
            }
        })
        .then(() => promptUserForNextAction());
}
function deleteEmployee() {
    db.getAllEmployees()
        .then((result) => {
            const employees = result[0];

            const employeeOptions = employees.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }));

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
function updateEmployeeRole() {
    db.findAllEmployees()
        .then(processEmployeeChoices)
        .then(promptForEmployeeId)
        .then(promptForRoleId)
        .then(updateEmployeeRoleInDatabase)
        .then(notifySuccess)
        .then(loadMainPrompts)
        .catch(handleError);
}

function processEmployeeChoices([rows]) {
    let employees = rows;
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    return employeeChoices;
}

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

function updateEmployeeRoleInDatabase({ employeeId, roleId }) {
    return db.updateEmployeeRole(employeeId, roleId);
}

function notifySuccess() {
    console.log("Updated employee's role");
}

function handleError(error) {
    console.error("An error occurred:", error);
}

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

function processEmployeeChoices([rows]) {
    let employees = rows;
    return employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
}

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

function promptForManagerId({ employeeId }) {
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

function updateManagerInDatabase({ employeeId, managerId }) {
    return db.updateEmployeeManager(employeeId, managerId);
}

function notifySuccess() {
    console.log("Updated employee's manager successfully.");
}

function handleError(error) {
    console.error("An error occurred during the process:", error);
}
function viewRoles() {
    db.findAllRoles()
        .then(displayRoles)
        .then(loadMainPrompts)
        .catch(handleError);
}

function displayRoles([rows]) {
    console.log("\n");
    console.table(rows);
}

function handleError(error) {
    console.error("An error occurred while retrieving roles:", error);
}

function addRole() {
    db.findAllDepartments()
        .then(processDepartmentChoices)
        .then(promptForRoleDetails)
        .then(addRoleToDatabase)
        .then(notifySuccess)
        .then(loadMainPrompts)
        .catch(handleError);
}

function processDepartmentChoices([rows]) {
    let departments = rows;
    return departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
}

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

function addRoleToDatabase(roleDetails) {
    return db.createRole(roleDetails);
}

function notifySuccess(roleDetails) {
    console.log(`Added ${roleDetails.title} to the database`);
}

function handleError(error) {
    console.error("An error occurred while adding the role:", error);
}

function removeRole() {
    db.findAllRoles()
        .then(processRoleChoices)
        .then(promptForRoleId)
        .then(confirmRoleRemoval)
        .then(removeRoleFromDatabase)
        .then(notifySuccess)
        .then(loadMainPrompts)
        .catch(handleError);
}

function processRoleChoices([rows]) {
    const roles = rows;
    return roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
}

function promptForRoleId(roleChoices) {
    return prompt([
        {
            type: "list",
            name: "roleId",
            message: "Which role do you want to remove? (Warning: This will also remove employees)",
            choices: roleChoices
        }
    ]);
}

function confirmRoleRemoval({ roleId }) {
    return prompt([
        {
            type: "confirm",
            name: "confirmRemoval",
            message: "Are you sure you want to remove this role? This action is irreversible and may remove associated employees as well.",
            default: false
        }
    ]).then(({ confirmRemoval }) => {
        if (confirmRemoval) {
            return roleId;
        } else {
            throw new Error("Role removal canceled by user.");
        }
    });
}

function removeRoleFromDatabase(roleId) {
    return db.removeRole(roleId);
}

function notifySuccess() {
    console.log("Removed role from the database successfully.");
}

function handleError(error) {
    console.error("An error occurred:", error);
}


const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser')
app.use(bodyparser.json());
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root1',
    password: 'root1',
    database: 'employeedb',
    multipleStatements: true
});

mysqlConnection.connect((err)=>{
    if(!err)
        console.log('Connection Successfull');
    else
        console.log('Not Successfull \n Error: ' + JSON.stringify(err, undefined, 2));
});

app.listen(3000,()=>console.log('Express server is running at port: 3000'));

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "A simple Express Library API",
		},
		servers: [
			{
				url: "http://localhost:3000",
			},
		],
	},
	apis: ["./*.js"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee Details:
 *       type: object
 *       required:
 *         - EmpID
 *         - Namee
 *         - EmpCode
 *         - Salary
 *       properties:
 *         EmpID:
 *           type: int
 *           description: The auto-generated id of the Employee
 *         Namee:
 *           type: string
 *           description: Name of the Employee
 *         EmpCode:
 *           type: string
 *           description: The Eployee Code
 *         Salary:
 *           type: int
 *           description: The salary of the Employee
 *       example:
 *         EmpID: 9
 *         Namee: Jimbro
 *         EmpCode: st45
 *         Salary: 45000
 */

/**
  * @swagger
  * tags:
  *   name: Employees
  *   description: The Employee managing API
  */

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: To get the list of all Employee
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: The list of the employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee Details'
 */

//Get all employees
app.get('/employees', (req, res) => {
    mysqlConnection.query('SELECT * FROM Employee', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get the Employee by id
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The Employee id
 *     responses:
 *       200:
 *         description: The Employee description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee Details'
 *       404:
 *         description: The Employee was not found
 */



//Get an employee
app.get('/employees/:id', (req, res) => {
    mysqlConnection.query('SELECT * FROM Employee WHERE EmpID = ?',[req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Remove the employee by id
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee id
 * 
 *     responses:
 *       200:
 *         description: The employee was deleted
 *       404:
 *         description: The employee was not found
 */

//Delete an employee
app.delete('/employees/:id', (req, res) => {
    mysqlConnection.query('DELETE FROM Employee WHERE EmpID = ?',[req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Delete operation sussessful');
        else
            console.log(err);
    })
});

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Add new Employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee Details'
 *     responses:
 *       200:
 *         description: Successfully added employee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee Details'
 *       500:
 *         description: Some server error
 */

//Insert an employee
app.post('/employees', (req, res) => {
    let emp = req.body;
    var sql = "SET @EmpID = ?;SET @Namee = ?;SET @EmpCode = ?;SET @Salary = ?; \
    CALL EmployeeAddOrEdit(@EmpID,@Namee,@EmpCode,@Salary);";
    mysqlConnection.query(sql, [emp.EmpID, emp.Namee, emp.EmpCode, emp.Salary], (err, rows, fields) => {
        if (!err)
            rows.forEach(element => {
                if(element.constructor == Array)
                res.send('Inserted employee id : '+element[0].EmpID);
            });
        else
            console.log(err);
    })
});

/**
 * @swagger
 * /employees:
 *   put:
 *     summary: Update Employee Details.
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee Details'
 *     responses:
 *       200:
 *         description: Successfully updated employee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee Details'
 *       404:
 *        description: The Employee was not found
 *       500:
 *         description: Some server error
 */


//Update an employee
app.put('/employees', (req, res) => {
    let emp = req.body;
    var sql = "SET @EmpID = ?;SET @Namee = ?;SET @EmpCode = ?;SET @Salary = ?; \
    CALL EmployeeAddOrEdit(@EmpID,@Namee,@EmpCode,@Salary);";
    mysqlConnection.query(sql, [emp.EmpID, emp.Namee, emp.EmpCode, emp.Salary], (err, rows, fields) => {
        if (!err)
           res.send('Updated Successfully');
        else
            console.log(err);
    })
});
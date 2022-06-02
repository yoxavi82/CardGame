var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mysql = require('mysql');


var app = express();

var bodyParser = require('body-parser');
const { route } = require('express/lib/application');
const { response } = require('express');


var connection = mysql.createPool({
	host: "37.59.55.185",
	user: "7atd0OBZX2",
	password: "lkxIEchd6U",
	database: "7atd0OBZX2"
});

//************************************************************************
//************************************************************************
router.post('/register', function (req, res) {
	console.log("req", req.body);
	username= req.body.username;
	var users = {
		"username":username ,
		"password": req.body.password,
		"email": req.body.email,
		"wins": 0
	};
	connection.query('INSERT INTO Users SET ?', users, function (error, results, fields) {
		if (error) {
			console.log("error ocurred", error);
			res.send({
				"code": 400,
				"failed": "error ocurred"
			});
		} else {
			console.log('The solution is: ', results);
			response.cookie("username", username );
			response.cookie("loggedin", true );
			res.send({
				"code": 200,
				"success": "user registered sucessfully"
			});
		}
	});
});

// http://localhost:3000/auth
router.post('/login', function (req, response) {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Redirect to home page
				
				response.cookie("username", username );
				response.cookie("loggedin", true );
				response.redirect('/game');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

//LEADERBOARD//
router.get('/leaderboard', function (req, res, next) {
	var table = 'SELECT username, wins FROM Users ORDER BY wins desc';
	console.log("server ok");
	connection.query(table, function (err, data, fields) {
		if (err) throw err;
		//res.render('/leaderboard.html', { user: 'Xavi', wins: "124" });
		res.render("pages/leaderboard",{listData:data})
		console.log(data);
	});
});

module.exports = router;
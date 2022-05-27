var express = require('express');
var router = express.Router();
var mysql      = require('mysql');
var mysql      = require('mysql');

var bodyParser = require('body-parser');
const { route } = require('express/lib/application');


var connection = mysql.createConnection({
	host: "37.59.55.185",
	user: "7atd0OBZX2",
	password: "lkxIEchd6U",
	database: "7atd0OBZX2"
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");

} else {
    console.log("Error connecting database ... nn");
}
});

//************************************************************************
//************************************************************************
router.post('/register',function(req,res){
  console.log("req",req.body);
  var users={
    "username":req.body.username,
    "password":req.body.password,
    "email":req.body.email,
    "wins":0
  };
  connection.query('INSERT INTO Users SET ?',users, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    });
  }else{
    console.log('The solution is: ', results);
    res.send({
      "code":200,
      "success":"user registered sucessfully"
        });
  }
  });
});



// http://localhost:3000/auth
router.post('/login', function(req, response) {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				// Redirect to home page
				response.redirect('/game.html');
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

// http://localhost:3000/game
router.get('/game.html', function(req, response) {
	// If the user is loggedin
	if (req.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + req.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

module.exports = router;
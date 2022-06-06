var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const bcrypt = require('bcrypt');

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

	if (req.body.username && req.body.password && req.body.email) {
		username = req.body.username;
		password = "";
		bcrypt.hash(req.body.password, 12).then(hash => {
			var users = {
				"username": username,
				"password": hash,
				"email": req.body.email,
				"wins": 0
			};
			connection.query('INSERT INTO Users SET ?', users, function (error, results, fields) {
				if (error) {
					res.redirect("/?register=user_exist")
				} else {

					res.cookie("username", username);
					res.cookie("loggedin", true);
					res.redirect("/game");
				}
			});
		});
	}else{
		res.redirect("/?register=empty_field");
	}

});

// http://localhost:3000/auth
router.post('/login', function (req, response) {
	// Ensure the input fields exists and are not empty
	if (req.body.username && req.body.password) {
		// Capture the input fields
		let username = req.body.username;
		let password = req.body.password;


		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM Users WHERE username = ? ', [username], async function (error, results, fields) {
			if (results.length > 0) {
				const isSame = await bcrypt.compare(password, results[0].password);


				if (isSame) {
					response.cookie("username", username);
					response.cookie("loggedin", true);
					response.redirect('/game');
				} else {
					//pass don't match
					response.redirect("/?login=user_not_found");
				}
				if (error) throw error;
			} else {
				response.redirect("/?login=user_not_found");
			}




			response.end();
		});


	} else {
		response.redirect("/?login=empty_field");
	}
});

//LEADERBOARD//
router.get('/leaderboard', function (req, res, next) {
	var table = 'SELECT username, wins FROM Users ORDER BY wins desc';
	connection.query(table, function (err, data, fields) {
		if (err) throw err;
		res.render("pages/leaderboard", { listData: data });
	});
});
module.exports = router;
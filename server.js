// This file starts the both the Express server, used to serve the actual webpage,
// and the Socket.io server, used to handle the the realtime connection to the client.

var express = require("express");
var mysql = require("mysql");

var connection = mysql.createConnection({
	host: "37.59.55.185",
	user: "7atd0OBZX2",
	password: "lkxIEchd6U",
	database: "7atd0OBZX2"
});

connection.connect(function (err) {
	if (err) {
		console.error('Error connecting: ' + err.stack);
		return;
	}

	console.log('Connected as id ' + connection.threadId);
});

connection.query('SELECT * FROM Users', function (error, results, fields) {
	if (error)
		throw error;

	results.forEach(result => {
		console.log(result);
	});
});

connection.end();


var app = express();
var http = require("http").Server(app);
var io = require("./libs/game_manager").listen(http);  // Start Socket.io server and let game_manager handle those connections

app.set("port", (process.env.PORT || 3001));  // Use either given port or 3001 as default
app.use(express.static("public"));  // Staticly serve pages, using directory 'public' as root 

// User connects to server
app.get("/", function (req, res) {
	// Will serve static pages, no need to handle requests
});

// If any page not handled already handled (ie. doesn't exists)
app.get("*", function (req, res) {
	res.status(404).send("Error 404 - Page not found");
});

// Start http server
http.listen(app.get("port"), function () {
	console.log("Node app started on port %s", app.get("port"));
});

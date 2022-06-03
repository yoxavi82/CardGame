// This file starts the both the Express server, used to serve the actual webpage,
// and the Socket.io server, used to handle the the realtime connection to the client.

var express = require("express");
var router = express.Router();
var mysql = require("mysql");
const session = require('express-session');
var path = require('path');
cookieParser = require('cookie-parser');


var app = express();
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.set('view engine', 'ejs');
var http = require("http").Server(app);
var io = require("./libs/game_manager").listen(http);  // Start Socket.io server and let game_manager handle those connections

app.set("port", (process.env.PORT || 3001));  // Use either given port or 3001 as default
app.use(express.static("public"));  // Staticly serve pages, using directory 'public' as root 

// User connects to server
app.get("/", function (req, res) {

  console.log(req.cookies);
  var logged =false;
  user = "Guest";
  if(req.cookies.loggedin==="true"){
    user = req.cookies.username;
    logged=true;
  }
  console.log(user +"/"+ logged + "/"+ req.cookies.loggedin);
	res.render('pages/index',{"username":  user, "logged": logged});
});

app.get("/logout", function (req, res) {
  res.clearCookie("username");
  res.clearCookie("logged");
  res.cookie("loggedin", false);
  res.render('pages/index',{"username":  "Guest", "logged": false});
  res.redirect("/");

});


app.get('/leaderboard', function (req, res) {
  var connection = mysql.createPool({
    host: "37.59.55.185",
    user: "7atd0OBZX2",
    password: "lkxIEchd6U",
    database: "7atd0OBZX2"
  });
  var table = 'SELECT username, email, wins FROM Users ORDER BY wins desc LIMIT 5';
  console.log("server ok");
  connection.query(table, function (err, data, fields) {
    if (err) throw err;
    //res.render('/leaderboard.html', { user: 'Xavi', wins: "124" });
    res.render("pages/leaderboard", { listData: data })
    console.log(data);
  });
});

app.get('/win', function (req, res) {
  var connection = mysql.createPool({
    host: "37.59.55.185",
    user: "7atd0OBZX2",
    password: "lkxIEchd6U",
    database: "7atd0OBZX2"
  });

  if(req.cookies.loggedin==="true")
    user = req.cookies.username;
  else
    return;
  var table = "UPDATE Users SET wins=wins+1 WHERE username='"+user+"'";
  connection.query(table, function (err, data, fields) {
    if (err) throw err;
    //res.render('/leaderboard.html', { user: 'Xavi', wins: "124" });

  });
});

/*app.get("/session", function (req, res) {
  let user="Guest";
  console.log("user="+res.cookie.username);
  if( req.session.username!=undefined){
user= req.session.username;
  }
	res.send({username:user});
});
*/


app.get("/game", function (req, res) {
  if(req.cookies.loggedin==="true")
    user = req.cookies.username;
  else
    user= "Guest";

    console.log(req.cookies.loggedin);
 
	res.render('pages/game',{username:  user})

});



app.get('/leaderboard', function (req, res) {
  var connection = mysql.createPool({
    host: "37.59.55.185",
    user: "7atd0OBZX2",
    password: "lkxIEchd6U",
    database: "7atd0OBZX2"
  });
  var table = 'SELECT username, email, wins FROM Users ORDER BY wins desc LIMIT 5';
  console.log("server ok");
  connection.query(table, function (err, data, fields) {
    if (err) throw err;
    //res.render('/leaderboard.html', { user: 'Xavi', wins: "124" });
    res.render("pages/leaderboard", { listData: data })
    console.log(data);
  });
})

// If any page not handled already handled (ie. doesn't exists)
app.get("*", function (req, res) {
  res.status(404).send("Error 404 - Page not found");
});

// Start http server
http.listen(app.get("port"), function () {
  console.log("Node app started on port %s", app.get("port"));
});


var register = require('./routes/connection');

const bodyParser = require('body-parser');
const { verify } = require("crypto");

app.use(session({
  secret: 'ACSXCSsecret',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));



app.use('/', register);


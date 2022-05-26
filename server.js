// This file starts the both the Express server, used to serve the actual webpage,
// and the Socket.io server, used to handle the the realtime connection to the client.

var express = require("express");
var router = express.Router();
var mysql = require("mysql");

var bodyParser = require('body-parser');



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


var register = require('./routes/connection');

app.use('/', register);


/*
//SQL

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
router.get('/register', function(req, res) {
	res.render('index');
  });

//************************************************************************
//************************************************************************
router.post('/register',function(req,res){
  console.log("req",req.body);
  var users={
    "username":req.body.username,
    "password":req.body.password,
    "email":req.body.email
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



router.post('/login',function(req,res){

  var email= req.body.email;
  var password = req.body.password;
  connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
    // console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    });
  }else{
    // console.log('The solution is: ', results);
    if(results.length >0){
      if(results[0].password == password){
        res.send({
          "code":200,
          "success":"login sucessfull"
            });
      }
      else{
        res.send({
          "code":204,
          "success":"Email and password does not match"
            });
      }
    }
    else{
      res.send({
        "code":204,
        "success":"Email does not exits"
          });
    }
  }
  });
});*/

// Imports


var express = require("express");
var router = express.Router();
var mysql = require("mysql");
const session = require('express-session');
var path = require('path');
cookieParser = require('cookie-parser');

//se define express como app
var app = express();

//indicamos que al app va a tener cookies que usaremos mas adelante para guardar la sesion del usuario loggeado
app.use(cookieParser());

//definimos la sesion para guardarla luego en las cookies
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

//establecemos ejs como motor de las vistas
app.set('view engine', 'ejs');

// Manejamos http y definimos que  el archivo “game_manager” va a ser el que escuche las peticiones http que en nuestro caso serán las llamadas de nuestro socket .


var http = require("http").Server(app);
var io = require("./libs/game_manager").listen(http); 

//Definimos el puerto 3001 
app.set("port", (process.env.PORT || 3001));

//Definimos el directorio "public" como raiz
app.use(express.static("public"));  


// cuando vas a la raiz redirigimos a la vista login y si ya has iniciado sesion enviamos la variable "logged" como true para mostrar la opción de logout 
// por lo contrario enviamos false si no se ha iniciado sesión para mostrar las opciones login y register
app.get("/", function (req, res) {

  var logged = false;
  user = "Guest";
  if (req.cookies.loggedin === "true") {
    user = req.cookies.username;
    logged = true;
  }
  res.render('pages/index', { "username": user, "logged": logged });
});

//cuando se recibe la llamada a “/logout” se borran todas cookies para poder volver a iniciar sesión. 
app.get("/logout", function (req, res) {
  res.clearCookie("username");
  res.clearCookie("logged");
  res.cookie("loggedin", false);
  res.render('pages/index', { "username": "Guest", "logged": false });
  res.redirect("/");

});

//Cuando se recibe la llamada a “/leaderboard” se busca en la base de datos los 5 usuarios con más victorias 
//para mandarlo como parámetro al redireccionar a la vista leaderboard.

app.get('/leaderboard', function (req, res) {
  var connection = mysql.createPool({
    host: "37.59.55.185",
    user: "7atd0OBZX2",
    password: "lkxIEchd6U",
    database: "7atd0OBZX2"
  });
  var table = 'SELECT username, email, wins FROM Users ORDER BY wins desc LIMIT 5';
  connection.query(table, function (err, data, fields) {
    if (err) throw err;
    user = "Guest";
    if (req.cookies.loggedin === "true") {
      user = req.cookies.username;
      logged = true;
    }
    res.render("pages/leaderboard", { listData: data, "username": user })
  });
});

//Cuando se recibe la llamada a “/win” se busca en la base de datos el usuario que está iniciado para añadirle una victoria.
app.get('/win', function (req, res) {
  var connection = mysql.createPool({
    host: "37.59.55.185",
    user: "7atd0OBZX2",
    password: "lkxIEchd6U",
    database: "7atd0OBZX2"
  });

  if (req.cookies.loggedin === "true")
    user = req.cookies.username;
  else
    return;
  var table = "UPDATE Users SET wins=wins+1 WHERE username='" + user + "'";
  connection.query(table, function (err, data, fields) {
    if (err) throw err;

  });
});



//Cuando se recibe la llamada a “/game” se busca en las cookies el usuario iniciado para mandarlo como parámetro con el redirect a la vista “game”.

app.get("/game", function (req, res) {
  if (req.cookies.loggedin === "true")
    user = req.cookies.username;
  else
    user = "Guest";



  res.render('pages/game', { username: user })

});


//Cuando se recibe la llamada a cualquier otra ruta que no sea las definidas anteriormente te llevará a la página 404
app.get("*", function (req, res) {
  res.status(404).render("pages/404");
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


var mysql = require('mysql');

var con = mysql.createConnection({
  host: "remotemysql.com:3306",
  user: "7atd0OBZX2",
  password: "7atd0OBZX2"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
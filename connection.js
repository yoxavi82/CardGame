var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'remotemysql.com:3306',
    database : '7atd0OBZX2',
    user     : '7atd0OBZX2',
    password : 'lkxIEchd6U',
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected as id ' + connection.threadId);
});
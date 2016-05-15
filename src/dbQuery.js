"use strict";
/*
Database Interface
Functions that talk to the database.
*/
var dbQuery = exports;

var mysql = require("mysql");
var privConf = require("./privConf");

dbQuery.init = ()=>{
  dbQuery.connection = mysql.createConnection({
    host     : privConf.sqlIp,
    user     : privConf.sqlUsername,
    password : privConf.sqlPassword,
    database : privConf.sqlUserDb
  });
  dbQuery.connection.connect();
};

dbQuery.logOnline = online=>{
  if(typeof(dbQuery.connection == "undefined")){
    dbQuery.connection = dbQuery.init();
  }

  dbQuery.connection.query(`INSERT INTO ${privConf.sqlUserTable} SET ?`, {users: online}, (err, res)=>{
    if(err){
      console.log("Unable to insert data into MySQL.");
    }
  });
};

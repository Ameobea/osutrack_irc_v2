"use strict";
/*
Database Interface
Functions that talk to the database.
*/
var dbQuery = exports;

var mysql = require("mysql");
var privConf = require("./privConf");
var pubConf = require("./pubConf");

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
  return new Promise((f,r)=>{
    if(typeof(dbQuery.connection == "undefined")){
      dbQuery.init();
    }

    dbQuery.connection.query(`INSERT INTO ${privConf.sqlUserTable} SET ?`, {users: online}, (err, res)=>{
      if(err){
        console.log("Unable to insert data into MySQL.");
      }else{
        if(pubConf.logOnlineInserts){
          console.log("Inserting online data into database.");
        }
      }
      f();
    });
  });
};

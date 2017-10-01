'use strict';
/*
Database Interface
Functions that talk to the database.
*/
var dbQuery = exports;

var mysql = require('mysql');
var privConf = require('./privConf');
var pubConf = require('./pubConf');

dbQuery.init = ()=>{
  dbQuery.connection = mysql.createConnection({
    host     : privConf.sqlIp,
    user     : privConf.sqlUsername,
    password : privConf.sqlPassword,
    database : privConf.sqlUserDb
  });

  dbQuery.connection.connect(err=>{
    if(err){
      console.log('Database disconnected - killing bot.');
      console.log(err);
      process.exit(1); //bot will be restarted automatically until db comes back
    }
  });
};

dbQuery.logOnline = online=>{
  return new Promise((f,r)=>{
    if(!dbQuery.connection){
      dbQuery.init();
    }

    dbQuery.connection.query(`INSERT INTO ${privConf.sqlUserTable} SET ?`, {users: online}, (err, res)=>{
      if(err){
        console.log('Unable to insert data into MySQL.');
      }else{
        if(pubConf.logOnlineInserts){
          console.log('Inserting online data into database.');
        }
      }
      f();
    });
  });
};

dbQuery.checkPreviousLink = discordID => {
  return new Promise((f,r) => {
    if(!dbQuery.connection){
      dbQuery.init();
    }

    dbQuery.connection.query(`SELECT * FROM ${privConf.discordLinkTable} WHERE discordID = ?`, [discordID], (err, res)=>{
      if(err){
        console.log('Unable to check data in MySQL.');
      }else{
        console.log('Checking for links within the database.');
      }
      f(res);
    });
  });
};

dbQuery.createLink = (discordID, osuName) => {
  return new Promise((f,r) => {
    if(!dbQuery.connection){
      dbQuery.init();
    }
    dbQuery.connection.query(`INSERT INTO ${privConf.discordLinkTable} (discordID, osuUser) VALUES (?,?)`, [discordID,osuName], (err, res)=>{//Complete this ting
      if(err){
        console.log('Unable to insert data in MySQL.');
        f('Unable to link user.');
      }else{
        console.log('Inserting links into the database.');
        f(`Successfully linked the user ${discordID} with the user ${osuName}`);
      }
    });
  });
};

dbQuery.updateLink = (discordID, osuName) => {
  return new Promise((f,r) => {
    if(!dbQuery.connection){
      dbQuery.init();
    }
    dbQuery.connection.query(`UPDATE ${privConf.discordLinkTable} SET osuUser=(?) WHERE discordID=(?)`, [osuName,discordID], (err, res)=>{
      if(err){
        console.log('Unable to update data in MySQL.');
        f('Unable to link user.');
      }else{
        console.log('Updating links in the database.');
        f(`Sucessfully updated the user ${discordID}`);
      }
    });
  });
};
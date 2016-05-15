"use strict";
/*
Osu!track API Interface
Contains functions for communitcating with the osu!track API
*/
var api = exports;

const https = require('https');

var pubConf = require("./pubConf");

api.getUpdate = (username, mode)=>{
  return new Promise((f,r)=>{
    var url = `${pubConf.apiAddress}get_changes.php?mode=${mode}&user=${username}`;
    https.get(url, res=>{
      var body = '';
      res.on('data', d=>{
        body += d;
      });
      res.on('end', ()=>{
        try{
          var parsed = JSON.parse(body);
          f(parsed);
        }catch(e){
          f(false);
        }
      });
    });
  });
};

api.getUser = (username, mode)=>{
  return new Promise((f,r)=>{
    var url = `${pubConf.apiAddress}get_user.php?mode=${mode}&user=${username}`;
    https.get(url, res=>{
      var body = '';
      res.on('data', d=>{
        body += d;
      });
      res.on('end', ()=>{
        try{
          var parsed = JSON.parse(body);
          f(parsed);
        }catch(e){
          f(false);
        }
      });
    });
  });
};

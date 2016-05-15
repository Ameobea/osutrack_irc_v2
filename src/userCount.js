"use strict";
/*
User Count
Keeps track of online users and logs them to the database.
*/
var pubConf = require("./pubConf");
var dbq = require("./dbQuery");

var count = exports;

count.log = client=>{
  return new Promise((f,r)=>{
    var online = Object.keys(client.chans["#osu"].users).length;
    dbq.logOnline(online).then(f,r);
  });
};

count.init = (delay, client)=>{
  count.log(client).then(()=>{
    setTimeout(()=>{
      count.init(delay, client);
    }, delay);
  }, console.log);
};

// { '#osu':
//    { key: '#osu',
//      serverName: '#osu',
//      users: {},
//      modeParams: {},
//      mode: '' } }

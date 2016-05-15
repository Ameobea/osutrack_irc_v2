"use strict";
/*
Osu!track IRC bot
An IRC bot that interfaces with the osu! chat service to provide players with an in-game
interfact to osu!track as well as provide other useful services.
See README.md for more information.
*/
var irc = require("irc");

var commands = require("./src/commands");
var privConf = require("./src/privConf");
var pubConf = require("./src/pubConf");
var mail = require("./src/mail");
var userCount = require("./src/userCount");

console.log("Starting bot...");
mail.init();

var client = new irc.Client(pubConf.ircServer, pubConf.ircUser, {
  password: privConf.ircPassword,
  channels: ['#osu'],
  floodProtection: true,
  floodProtectionDelay: 300,
});

client.join("#osu", ()=>{
  console.log("Joined #osu...");
  setTimeout(()=>{
    mail.startupDeliver(client);

    userCount.init(pubConf.usercountDelay, client);
    console.log("Initialized online users iterator...");
  }, 1000);
});

client.addListener('pm', (nick, message)=>{
  commands.parseCommand(nick, message, client).then(res=>{
    //TODO: Logging sent/recieved messages
    if(Array.isArray(res)){
      res.forEach(msg=>{
        client.say(nick, msg);
        console.log(`Sending message to ${nick}: ${msg}`);
      });
    }else{
      client.say(nick, res);
      console.log(`Sending message to ${nick}: ${res}`);
    }
  });
});

client.addListener('join', (channel, username)=>{
  mail.check(client, username);
});

console.log("Bot started.");

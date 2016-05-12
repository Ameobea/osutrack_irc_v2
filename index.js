"use strict";
/*
Osu!track IRC bot
An IRC bot that interfaces with the osu! chat service to provide players with an in-game
interfact to osu!track as well as provide other useful services.
See README.md for more information.
*/
var irc = require('irc');

var commands = require('./src/commands');
var privConf = require('./src/privConf');

console.log("Starting bot...");
var client = new irc.Client('cho.ppy.sh', 'Ameo', {
  password: privConf.ircPassword,
  channels: ['#osu'],
  floodProtection: true,
  floodProtectionDelay: 300,
});

client.addListener('pm', commands.parseCommand);

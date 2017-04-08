"use strict";
/**
 * Main Test
 * This test is just to verify that the bot processes messages correctly
 * acts as expected.
 */
var irc = require('irc');
var simplest = require("simplest-test").init();
var test = simplest.test;

var commands = require('../src/commands');
var privConf = require('../src/privConf');

var client = new irc.Client('cho.ppy.sh', 'Ameo', {
  password: privConf.ircPassword,
  channels: ['#osu'],
  floodProtection: true,
  floodProtectionDelay: 300,
});

var testCommand = command=>{
  return new Promise((f,r)=>{
    commands.parseCommand("Ameo", command).then(res=>{
      console.log(`${command}: ${res}`);
      test(res == "test update", command);
    }, res=>{
      console.log(res);
      test(false, command);
    }).then(f);
  });
};

var messages = [
  "!u Ameo",
  "!u Ameo taiko",
  "!u Ameo CTB",
  "!u Wub Woof Wolf",
  "!u Wub Woof Wolf ctb",
  "!s ameo"
];

var promises = [];

messages.forEach(message=>{
  promises.push(testCommand(message));
});

Promise.all(promises).then(simplest.done).then(()=>{process.exit(0);});

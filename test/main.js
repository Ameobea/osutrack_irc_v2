'use strict';
/**
 * Main Test
 * This test is just to verify that the bot processes messages correctly
 * acts as expected.
 */
const irc = require('irc');
const simplest = require('simplest-test').init();
const test = simplest.test;

const commands = require('../src/commands');
const privConf = require('../src/privConf');

var testCommand = command => {
  return new Promise((f, r) => {
    commands
      .parseCommand('Ameo', command)
      .then(
        res => {
          console.log(`${command}: ${res}`);
          test(res == 'test update', command);
        },
        res => {
          console.log(res);
          test(false, command);
        }
      )
      .then(f);
  });
};

const messages = [
  '!u Ameo',
  '!u Ameo taiko',
  '!u Ameo CTB',
  '!u Wub Woof Wolf',
  '!u Wub Woof Wolf ctb',
  '!s ameo',
];

const promises = [];

messages.forEach(message => {
  promises.push(testCommand(message));
});

Promise.all(promises)
  .then(simplest.done)
  .then(() => {
    process.exit(0);
  });

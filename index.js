'use strict';
/**
 * Osu!track IRC bot
 * An IRC bot that interfaces with the osu! chat service to provide players with an in-game
 * interfact to osu!track as well as provide other useful services.
 * See README.md for more information.
 */
const irc = require('irc');
const Eris = require('eris');

const commands = require('./src/commands');
const privConf = require('./src/privConf');
const pubConf = require('./src/pubConf');
const mail = require('./src/mail');
const userCount = require('./src/userCount');
const dbq = require('./src/dbQuery');

console.log('Starting bot...');
mail.init();

var ircClient = new irc.Client(pubConf.ircServer, pubConf.ircUser, {
  password: privConf.ircPassword,
  channels: ['#osu'],
  floodProtection: true,
  floodProtectionDelay: 777,
});

// Object that simulates the functionality of the functionality of the IRC client so that we don't have
// to change any of the command-handling code.
const discordAdapter = {
  // dummy method that doesn't do anything since Discord client doesn't support sending mail to osu! right now
  say: (username, msg) => {},
};

ircClient.join('#osu', () => {
  console.log('Joined #osu...');
  setTimeout(() => {
    mail.startupDeliver(ircClient);

    userCount.init(pubConf.usercountDelay, ircClient);
    console.log('Initialized online users iterator...');
  }, 1000);
});

ircClient.addListener('pm', (nick, message)=>{
  commands.parseCommand(nick, message, ircClient, false).then(res => {
    console.log(`New IRC message from ${nick}: ${message}`);

    if(Array.isArray(res)) {
      res.forEach(msg => {
        ircClient.say(nick, msg);
        console.log(`Sending message to ${nick}: ${msg}`);
      });
    } else {
      ircClient.say(nick, res);
      console.log(`Sending message to ${nick}: ${res}`);
    }
  });
});

ircClient.addListener('kill', (nick, reason, channels, message)=>{
  if(nick.toLowerCase() == pubConf.ircUser){
    console.log('Bot killed from server...');
  }
});

ircClient.addListener('error', message=>{
  console.log(`New error from IRC server: ${message}`);
});

ircClient.addListener('join', (channel, username)=>{
  mail.check(ircClient, username);
});

var discordClient = new Eris(privConf.discordBotToken);

discordClient.on('ready', () => {
  console.log('Successfully initialized Discord bot connection!');
});

/**
 * Given a message as either an Object, String, or Array of String/Objects, sends it or all messages in the array to the
 * specified channel in order.
 */
function sendDiscordMessage(message, channel) {
  if(!message.title) {
    // is a normal message and not an embed
    channel.createMessage({
      content: message,
      tts: false,
      disableEveryone: true,
    });
  } else {
    // is an embed object
    channel.createMessage({
      embed: message,
      tts: false,
      disableEveryone: true,
    });
  }
}

discordClient.on('messageCreate', msg => {
  const nick = new Promise((f,r) => {
    dbq.checkPreviousLink(discordID).then(username => {
      if(username.length !== 0){
        f(username.join(' ')); //Does it return an array?
      } else{
        f(msg.author.username)
      }
    });
  });
  /*This may bring up some issues, using the method I have used. 
  This is due to the fact that every command will use the nick chosen. 
  This could be fixed by passing a fith variable through the parseCommand which means both the 
  potential nick or msg.author.username wil be sent.*/
  commands.parseCommand(msg.author.username, msg.cleanContent, discordAdapter, msg.author.id).then(res => { 
    console.log(`New Discord message from ${msg.author.username}: ${msg.cleanContent}`);

    // ignore if we don't handle the command since other bots may also be listening
    if(res == 'Unknown command; try !help')
      return;

    if(Array.isArray(res)) {
      res.forEach(subMsg => {
        sendDiscordMessage(subMsg, msg.channel);
      });
    } else {
      sendDiscordMessage(res, msg.channel);
    }
  }).catch(err => console.log(`Error during parseCommand: ${err}`));
});

discordClient.connect();

console.log('Bot started.');

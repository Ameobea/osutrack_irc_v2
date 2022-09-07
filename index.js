'use strict';
/**
 * Osu!track IRC bot
 * An IRC bot that interfaces with the osu! chat service to provide players with an in-game
 * interfact to osu!track as well as provide other useful services.
 * See README.md for more information.
 */
const irc = require('irc');
const { Client: DiscordJsClient, GatewayIntentBits } = require('discord.js');

const commands = require('./src/commands');
const privConf = require('./src/privConf');
const pubConf = require('./src/pubConf');
const mail = require('./src/mail');
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
  say: (_username, _msg) => {},
};

ircClient.join('#osu', () => {
  console.log('Joined #osu...');
  setTimeout(() => mail.startupDeliver(ircClient), 1000);
});

ircClient.addListener('pm', (nick, message) =>
  commands.parseCommand(nick, message, ircClient, false).then((res) => {
    console.log(`New IRC message from ${nick}: ${message}`);

    if (Array.isArray(res)) {
      res.forEach((msg) => {
        ircClient.say(nick, msg);
        console.log(`Sending message to ${nick}: ${msg}`);
      });
    } else {
      ircClient.say(nick, res);
      console.log(`Sending message to ${nick}: ${res}`);
    }
  })
);

ircClient.addListener('kill', (nick, _reason, _channels, _message) => {
  if (nick.toLowerCase() == pubConf.ircUser) {
    console.log('Bot killed from server...');
  }
});

ircClient.addListener('error', (message) =>
  console.log(`New error from IRC server: ${message}`)
);

ircClient.addListener('join', (_channel, username) =>
  mail.check(ircClient, username)
);

const client = new DiscordJsClient({ intents: GatewayIntentBits.Guilds });

client.once('ready', () => {
  console.log('Discord client ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const emulatedMessage = interaction.options.data.reduce(
    (prev, curr) => `${prev} ${curr.value}`,
    `!${interaction.commandName}`
  );

  console.log(`Emulating IRC message: ${emulatedMessage}`);

  const ephemeralCommands = ['link'];

  if (ephemeralCommands.includes(interaction.commandName)) {
    await interaction.deferReply({ ephemeral: true });
  } else {
    await interaction.deferReply();
  }

  try {
    const username = await dbq.checkPreviousLink(interaction.user.id);
    const nick = username ? username : interaction.user.username;
    commands
      .parseCommand(nick, emulatedMessage, discordAdapter, interaction.user.id)
      .then(async (res) => {
        console.log(`New Discord message from ${nick}: ${emulatedMessage}`);

        // ignore if we don't handle the command since other bots may also be listening
        if (res == 'Unknown command; try !help') return;
        if (Array.isArray(res)) {
          res.forEach(async (subMsg) => {
            await sendDiscordMessage(subMsg, interaction);
          });
        } else {
          await sendDiscordMessage(res, interaction);
        }
      });
  } catch (error) {
    console.log(`Error during parseCommand: ${error}`);
    interaction.editReply('An error occurred while processing your command.');
  }
});

/**
 * Given a message as either an Object, String, or Array of String/Objects, sends it or all messages in the array to the
 * specified channel in order.
 */
async function sendDiscordMessage(message, interaction) {
  if (!message.title) {
    // is a normal message and not an embed
    await interaction.editReply(message);
  } else {
    // is an embed object
    await interaction.editReply({ embeds: [message] });
  }
}

client.login(privConf.discordBotToken);

console.log('Bot started.');

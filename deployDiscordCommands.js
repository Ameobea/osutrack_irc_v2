'use strict';
/*
 *  Discord Bot Interface
 *  Registers slash commands and handles events.
 */

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { discordBotToken, discordClientId } = require('./src/privConf');

const modeChoices = [
  { name: 'standard', value: 'standard' },
  { name: 'taiko', value: 'taiko' },
  { name: 'catch', value: 'ctb' },
  { name: 'mania', value: 'mania' },
];

const commands = [
  new SlashCommandBuilder()
    .setName('update')
    .setDescription(
      "Updates a user's data in the osu!track database and shows what has changed since the last update."
    )
    .addStringOption(option =>
      option.setName('username').setRequired(false).setDescription('The osu! username to update.')
    )
    .addStringOption(option =>
      option
        .setName('mode')
        .setRequired(false)
        .setDescription('The osu! mode to update. Defaults to osu!standard.')
        .addChoices(...modeChoices)
    ),
  new SlashCommandBuilder()
    .setName('u')
    .setDescription(
      "Updates a user's data in the osu!track database and shows what has changed since the last update."
    )
    .addStringOption(option =>
      option.setName('username').setRequired(false).setDescription('The osu! username to update.')
    )
    .addStringOption(option =>
      option
        .setName('mode')
        .setRequired(false)
        .setDescription('The osu! mode to update. Defaults to osu!standard.')
        .addChoices(...modeChoices)
    ),
  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Links your username with an osu! username.')
    .addStringOption(option =>
      option.setName('username').setRequired(true).setDescription('The osu! username to link.')
    ),
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Views basic information about your or another user.')
    .addStringOption(option =>
      option
        .setName('username')
        .setRequired(false)
        .setDescription('The osu! username to view stats for.')
    )
    .addStringOption(option =>
      option
        .setName('mode')
        .setRequired(false)
        .setDescription('The osu! mode to view stats for. Defaults to osu!standard')
        .addChoices(...modeChoices)
    ),
  new SlashCommandBuilder()
    .setName('contact')
    .setDescription('Gives information about how to contact the devs about the bot'),
];

const rest = new REST({ version: '10' }).setToken(discordBotToken);

(async () => {
  try {
    console.log('Starting bot...');

    await rest.put(Routes.applicationCommands(discordClientId), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

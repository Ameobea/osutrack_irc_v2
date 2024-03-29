# Osu!track IRC Bot v2
The osu!track IRC bot is a tool that allows osu! plays to access osu!track and update their statistics using the in-game chat system.  It works by connecting to the osu! IRC servers (on which the chat system is built) and communicating with the osu!track API to respond to im-game PMs to my account and respond with data from osu!track.

This is the second version of the bot; the first version was closed-source, buggy, and glitchy which eventually led to its discontinuation.  This version was re-written with osu!'s open-source vision in mind which has the added bonus of allowing others to help me with the software, use it in their own cool projects, and help make this one better.

# Installation
 1. Install NodeJS and MySQL (or at least have a MySQL database to connect to).  Create a database for the bot to use.
 2. Obtain a Discord API Key for the application from here: https://discordapp.com/developers/applications/me/create
 3. Obtain an osu! IRC token from here: https://osu.ppy.sh/p/irc
 4. Copy the `/src/privConf.sample.js` file to `/src/privConf.js` and change the values to those appropriate for your installation.
 5. Install dependencies by running `npm i` or `yarn` in the project root directory
 6. Run `node deployDiscordCommands.js` to populate the slash commands used by the application
 7. Start the bot by executing the `start.sh` script in the project root.

Note that the `deployDiscordCommands.js` script should only be run if new slash commands are being added or previous commands are being edited. The Discord API rate limiting is very strict for adding slash commands.

# Using the bot
The bot should be running live on my account, Ameo.  To use it, just send a message to Ameo in-game with one of the commands that the bot recognizes.  (A full list of commands that the bot recognizes as well as guides on what they do can be found on [the osu!track website](https://ameobea.me/osutrack/updater/index.php).)

# Contributing
If you want to contribute to this project by fixing a bug or making some small tweak, please feel free to fork it and submit a pull request.  If you want to add some larger addition such as a new command or feature, I'd appreciate it if you contacted me first to talk about the idea.  However, I'm certainly open to having others work on this project with me!

# Osu!track API
Osu!track has an unofficial API that is used for this bot to allow it to interface with the osu!track database and core functionality.  If you want to use this API in an application of your own, *please* ask me before-hand so I don't get hit with a ton of unexpected load.  However, I'm very happy to work with people and allow access for projects of their own.

In addition, I'm willing to give partial or full data dumps of the main osu!track database containing user stats updates, hiscore history, and online user counts to whomever wants it.  For more information, send me an email (me@ameo.link) or DM me on Twitter (@ameobea10).


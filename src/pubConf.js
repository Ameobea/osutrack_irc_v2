"use strict";
/**
 Public configuration settings for the bot.
 */
var pubConf = exports;

/******************************************************************\
 * If you want to use the osu!track API, please let me know       *
 * before hand just so I know you won't overload my poor servers. *
\******************************************************************/
pubConf.apiAddress = 'https://ameobea.me/osutrack/api/';

pubConf.ircServer = 'cho.ppy.sh';
pubConf.ircUser = 'Ameo';

pubConf.usercountDelay = 7.5 * 60 * 1000; //ms between logging online users
pubConf.logOnlineInserts = false; //set to true to log to file every time an online users datapoint is stored

pubConf.ameotrackEnabled = true; //only set to true if you're Ameo

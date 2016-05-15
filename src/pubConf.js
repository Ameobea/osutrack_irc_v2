"use strict";
/*
Public configuration settings for the bot.
*/
var pubConf = exports;

/*************************************************************
If you want to use the osu!track API, please let me know
before hand just so I know you won't overload my poor servers.
**************************************************************/
pubConf.apiAddress = "https://ameobea.me/osutrack/api/";

pubConf.usercountDelay = 7.5 * 60 * 1000; //ms between logging online users

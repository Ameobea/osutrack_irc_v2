'use strict';
/***
 * User Count
 *
 * Keeps track of online users and logs them to the database.
 */

const dbq = require('./dbQuery');

const count = exports;

count.log = client =>
  new Promise((f, r) => {
    const online = Object.keys(client.chans['#osu'].users).length;
    dbq.logOnline(online).then(f, r);
  });

count.init = (delay, client) =>
  count.log(client).then(() => setTimeout(() => count.init(delay, client), delay), console.log);

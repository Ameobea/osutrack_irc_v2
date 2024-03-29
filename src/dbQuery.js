'use strict';
/**
 * Database Interface
 * Functions that talk to the database.
 */
const dbQuery = exports;

const mysql = require('mysql');
const privConf = require('./privConf');

dbQuery.init = () => {
  dbQuery.connection = mysql.createConnection({
    host: privConf.sqlIp,
    user: privConf.sqlUsername,
    password: privConf.sqlPassword,
    database: privConf.sqlUserDb,
  });

  dbQuery.connection.connect(err => {
    if (err) {
      console.error('Database disconnected - killing bot.');
      console.error(err);
      process.exit(1); // Bot will be restarted automatically until db comes back
    }
  });
};

dbQuery.checkPreviousLink = discordID =>
  new Promise((f, r) => {
    if (!dbQuery.connection) {
      dbQuery.init();
    }

    dbQuery.connection.query(
      `SELECT * FROM ${privConf.discordLinkTable} WHERE discordID = ?`,
      [discordID],
      (err, res) => {
        f(res.length > 0 && res[0].osuUser);
      }
    );
  });

dbQuery.createLink = (discordID, osuName) =>
  new Promise(f => {
    if (!dbQuery.connection) {
      dbQuery.init();
    }

    dbQuery.connection.query(
      `INSERT INTO ${privConf.discordLinkTable} (discordID, osuUser) VALUES (?,?)`,
      [discordID, osuName],
      err => {
        if (err) {
          console.log('Unable to insert data in MySQL.');
          f('`Unable to link user.`');
        } else {
          console.log('Inserting links into the database.');
          f(`\`Successfully linked the user ${discordID} with the user ${osuName}\``);
        }
      }
    );
  });

dbQuery.updateLink = (discordID, osuName) =>
  new Promise(f => {
    if (!dbQuery.connection) {
      dbQuery.init();
    }

    dbQuery.connection.query(
      `UPDATE ${privConf.discordLinkTable} SET osuUser=(?) WHERE discordID=(?)`,
      [osuName, discordID],
      err => {
        if (err) {
          console.log('Unable to update data in MySQL.');
          f('Unable to link user.');
        } else {
          console.log('Updating links in the database.');
          f(`Sucessfully updated the user ${discordID}`);
        }
      }
    );
  });

'use strict';
/**
 * Osu!track API Interface
 * Contains functions for communitcating with the osu!track API
 */

const api = exports;

const https = require('https');

const pubConf = require('./pubConf');

api.getUpdate = (username, mode) =>
  new Promise((f, r) => {
    var url = `${pubConf.apiAddress}get_changes.php?mode=${mode}&user=${username}`;
    https.get(url, res => {
      var body = '';
      res.on('data', d => {
        body += d;
      });
      res.on('end', () => {
        try {
          var parsed = JSON.parse(body);
          f(parsed);
        } catch (e) {
          f(false);
        }
      });
    });
  });

api.getUser = (username, mode) =>
  new Promise((f, r) => {
    var url = `${pubConf.apiAddress}get_user.php?mode=${mode}&user=${username}`;
    https.get(url, res => {
      var body = '';
      res.on('data', d => {
        body += d;
      });
      res.on('end', () => {
        try {
          var parsed = JSON.parse(body);
          f(parsed);
        } catch (e) {
          f(false);
        }
      });
    });
  });

api.getUserHiscores = async (username, mode) => {
  const idURL = `https://osu-api-bridge.ameo.dev/users/${encodeURIComponent(username)}/id?mode=${mode}`;
  const userID = await fetch(idURL).then(res => res.text()).catch(() => null);
  if (!userID) {
    console.error(`Failed to fetch user ID for username: ${username}`);
    return [];
  }
  const url = `https://osu-api-bridge.ameo.dev/users/${userID}/hiscores?mode=${mode}`;
  return fetch(url)
    .then(res => res.json())
    .catch((err) => {
      console.error(`Failed to fetch hiscores for user: ${username}`, err);
      return [];
    });
}

// Command Parser
// Processes queries to the bot, executes necessary commands, and returns result.
'use strict';

var commands = exports;

var https = require('https');
const _ = require('lodash');

var api = require('./api');
var mail = require('./mail');
var pubConf = require('./pubConf');
var privConf = require('./privConf');
var dbq = require('./dbQuery');

var modeIdToString = id => {
  if (id === 0 || id == '0') {
    return 'standard';
  } else if (id == 1 || id == '1') {
    return 'taiko';
  } else if (id == 2 || id == '2') {
    return 'ctb';
  } else if (id == 3 || id == '3') {
    return 'mania';
  } else {
    return 'unknown';
  }
};

commands.parseCommand = (nick, message, client, discordID) =>
  new Promise((f, r) => {
    message = message.trim();
    var origSplit = message.split(' ');
    var lower = message.toLowerCase();
    var split = lower.split(' ');
    var command = split[0];
    var secret = false;
    var isCommand = true;

    if (command == '!u' || command == '!update' || command == '!t' || command == '!track') {
      commands.update(nick, split, discordID, message).then(f, r);
    } else if (command === '!l' || command === '!link') {
      commands.link(origSplit, discordID).then(f, r);
    } else if (command === '!s' || command === 'stat' || command == '!stats') {
      commands.stats(nick, split, discordID).then(f, r);
    } else if (command === '!r' || command === '!recommend' || command == '!recomend') {
      f(commands.givePP());
    } else if (command === '!m' || command === '!mail' || command == '!msg' || command == '!tell' || command == '!pm') {
      secret = true;
      if (!discordID) {
        f(commands.mail(nick, origSplit, client));
      } else {
        f('Unable to send mail to other users from the Discord client.');
      }
    } else if (command === '!help' || command === '!h') {
      f('For a full list of commands, visit https://ameobea.me/osutrack/updater/');
    } else if (command === '!contact') {
      f('PM me on the osu! website, send an email to me@ameo.link, or PM me on reddit /u/ameobea.');
    } else if (command === '!reddit') {
      if (discordID) {
        f('<https://www.reddit.com/r/osugame/>');
      } else {
        f('[https://reddit.com/r/osugame /r/osugame]');
      }
    } else if (command === '!site') {
      if (discordID) {
        f('<https://ameobea.me/osutrack/>');
      } else {
        f('[https://ameobea.me/osutrack/ osu!track website]');
      }
    } else if (command === '!forums' || command === '!forum') {
      if (discordID) {
        f('<https://osu.ppy.sh/forum/>');
      } else {
        f('[https://osu.ppy.sh/forum/ osu! forums]');
      }
    } else {
      if (message.length > 0 && message[0] === '!') {
        f('Unknown command; try !help');
      } else {
        isCommand = false;
        secret = true;
      }
    }

    if (message.toLowerCase().indexOf('good night') != -1) {
      client.say(nick, 'Good night; sleep well; have good dreams.');
    }

    if (pubConf.ameotrackEnabled && isCommand) {
      var reqUrl = `${privConf.ameotrackIp}?type=event&category=osutrack_irc&password=`;
      reqUrl += `${privConf.ameotrackPassword}&data={from: ${nick}, message: ${secret ? 'redacted' : message}}`;
      https.get(reqUrl);
    }
  });

commands.update = (nick, split, discordID) => {
  var createString = (data, username) => {
    if (!data) {
      return 'Osu!track database is under heavy load; please try again in a few seconds.';
    }

    if (!data.exists) {
      return `The user ${data.username} can't be found.  Try replaced spaces with underscores and try again.`;
    } else if (data.first) {
      return `${data.username} is now tracked.  Gain some PP and !update again!`;
    } else if (!discordID) {
      data.pp_rank = -1 * parseInt(data.pp_rank);
      let res = `Rank: ${data.pp_rank >= 0 ? '+' : ''}${data.pp_rank.toLocaleString()}`;
      res += ` (${data.pp_raw >= 0 ? '+' : ''}${Math.round(data.pp_raw * 1000) / 1000} pp) in ${parseInt(
        data.playcount
      ).toLocaleString()} plays. `;
      res += `| View detailed data on [https://ameobea.me/osutrack/user/${encodeURIComponent(username)}`;
      if (data.mode !== 0 && data.mode !== '0') {
        res += `/${modeIdToString(data.mode)}`;
      }
      res += ' osu!track].';

      res = [res];
      if (data.newhs && data.newhs.length > 0) {
        var s = data.newhs.length > 1 ? 's' : '';
        var c = data.newhs.length < 4 ? ':' : '. ';

        var hsMessage = `${data.newhs.length} new hiscore${s}${c} `;

        let i = 0;
        data.newhs.forEach(hs => {
          if (i <= 2) {
            hsMessage += `[https://osu.ppy.sh/b/${hs.beatmap_id} #${hs.ranking + 1}]: ${hs.pp}pp; `;
            i++;
          } else if (i == 3) {
            hsMessage += 'More omitted. ';
            i++;
          }
        });

        hsMessage += `View your recent hiscores on [https://ameobea.me/osutrack/user/${encodeURIComponent(
          username
        )} osu!track].`;
        res.push(hsMessage);
      }

      if (data.levelup) {
        res.push('Congratulations on leveling up!');
      }

      return res;
    }

    data.pp_rank = -1 * parseInt(data.pp_rank);
    const osutrackProfileLink = `https://ameobea.me/osutrack/user/${encodeURIComponent(
      username
    )}${data.mode !== 0 && data.mode !== '0' ? `/${modeIdToString(data.mode)}` : ''}`;
    const osuProfileLink = `https://osu.ppy.sh/u/${encodeURIComponent(username)}`;
    const descriptionLines = [
      `[**osu!track Profile**](${osutrackProfileLink}) \u00B7 [**osu! Profile**](${osuProfileLink})`,
      `**Rank**: ${data.pp_rank >= 0 ? '+' : ''}${data.pp_rank.toLocaleString()}`,
      `**PP**: ${data.pp_raw >= 0 ? '+' : ''}${Math.round(data.pp_raw * 1000) / 1000} pp`,
      `**Playcount**: ${parseInt(data.playcount).toLocaleString()}`,
      `**Accuracy**: ${data.accuracy >= 0 ? '+' : ''}${parseInt(data.accuracy.toLocaleString())}`,
    ];

    if (data.newhs.length > 0) {
      descriptionLines.push('\n**_New Hiscores_**:');
    }

    let i = 0;
    data.newhs.forEach(hs => {
      if (i <= 2) {
        descriptionLines.push(`[#${hs.ranking + 1} personal best](https://osu.ppy.sh/b/${hs.beatmap_id}): ${hs.pp}pp`);
        i++;
      } else if (i == 3) {
        descriptionLines.push('More omitted. ');
        i++;
      }
    });

    return {
      title: `Changes since last update for **${data.username}**`,
      description: descriptionLines.join('\n'),
    };
  };

  return new Promise((f, r) => {
    if (split.length === 1) {
      api.getUpdate(nick, 0).then(raw => f(createString(raw, nick)), r);
      return;
    }

    var last = split[split.length - 1];
    var username = nick;
    var mode = 0;
    var hasMode = false;

    if (last == 'osu' || last == 'standard' || last == 'std') {
      hasMode = true;
    } else if (last == 'taiko' || last == 'tiako') {
      hasMode = true;
      mode = 1;
    } else if (last == 'mania' || last == 'manai') {
      hasMode = true;
      mode = 3;
    } else if (last == 'ctb' || last == 'cbt' || last == 'catch') {
      hasMode = true;
      mode = 2;
    }

    if (hasMode) {
      if (split.length > 2) {
        username = '';

        for (let i = 1; i < split.length - 1; i++) {
          username += i == 1 ? '' : '_';
          username += split[i];
        }

        username = username.trim();
      }

      api.getUpdate(username, mode).then(raw => f(createString(raw, username.replace(' ', '%20'))), r);
      return;
    }

    if (split.length > 2) {
      username = '';
      for (let i = 1; i < split.length; i++) {
        username += i == 1 ? '' : ' ';
        username += split[i];
      }
      username = username.trim();

      api.getUpdate(username, 0).then(raw => f(createString(raw, username.replace(' ', '%20'))), r);
      return;
    }

    api.getUpdate(split[1], 0).then(raw => f(createString(raw, split[1])), r);
  });
};

commands.stats = (nick, split, discordID) => {
  const createString = data => {
    if (data) {
      if (!discordID) {
        var res = `Username: ${data.username} | Rank: ${parseInt(data.pp_rank).toLocaleString()}`;
        res += ` | PP: ${parseFloat(data.pp_raw).toLocaleString()} | Acc: ${Math.round(data.accuracy * 1000) / 1000}`;
        res += ` | Playcount: ${parseInt(data.playcount).toLocaleString()} | Level: ${data.level}`;
        return res;
      } else {
        // construct an embed object to be inserted into the message
        const encodedUsername = encodeURIComponent(data.username);
        return {
          title: `Stats for ${data.username}`,
          description: [
            `[**osu!track Profile**](https://ameobea.me/osutrack/user/${encodedUsername}) \u00B7 [**osu! Profile**](https://osu.ppy.sh/u/${encodedUsername})`,
            `**Rank**: ${parseInt(data.pp_rank).toLocaleString()}`,
            `**PP**: ${parseFloat(data.pp_raw).toLocaleString()}`,
            `**Accuracy**: ${Math.round(data.accuracy * 1000) / 1000}`,
            `**Playcount**: ${parseInt(data.playcount).toLocaleString()}`,
            `**Level**: ${data.level}`,
          ].join('\n'),
        };
      }
    } else {
      return 'Osu!track database is under heavy load; please try again in a few seconds.';
    }
  };

  return new Promise((f, r) => {
    if (split.length === 1) {
      api.getUser(nick, 0).then(raw => f(createString(raw)), r);
      return;
    }
    var last = split[split.length - 1];
    var username = nick;
    var mode = 0;
    var hasMode = false;

    if (['osu', 'standard', 'std'].includes(last)) {
      hasMode = true;
    } else if (last === 'taiko' || last === 'tiako') {
      hasMode = true;
      mode = 1;
    } else if (last === 'mania' || last === 'manai') {
      hasMode = true;
      mode = 3;
    } else if (['ctb', 'cbt', 'catch'].includes(last)) {
      hasMode = true;
      mode = 2;
    }

    if (hasMode) {
      if (split.length > 2) {
        username = '';

        for (var i = 1; i < split.length - 1; i++) {
          username += i == 1 ? '' : '_';
          username += split[i];
        }
        username = username.trim();
      }

      api.getUser(username, mode).then(raw => f(createString(raw)), r);
      return;
    }

    if (split.length > 2) {
      username = '';
      for (let i = 1; i < split.length; i++) {
        username += i == 1 ? '' : '_';
        username += split[i];
      }
      username = username.trim();

      api.getUser(username, 0).then(raw => f(createString(raw)), r);
    } else {
      api.getUser(split[1], 0).then(raw => f(createString(raw)), r);
    }
  });
};

commands.mail = (nick, split, client) =>
  new Promise((f, r) => {
    var message = '';
    if (split.length < 3) {
      f('You must supply a recipient and message like this: !m rrtyui pls enjoy game');
    } else {
      for (let i = 2; i < split.length; i++) {
        message += ' ' + split[i];
      }

      mail.send(nick, split[1], message, client).then(f, r);
    }
  });

commands.link = (origSplit, discordID) => {
  if (!discordID) {
    return Promise.resolve("Linking only works if you're using Discord");
  }

  const osuName = _.tail(origSplit).join(' ');

  return dbq.checkPreviousLink(discordID).then(username => {
    if (!username && username !== '') {
      return dbq.createLink(discordID, osuName);
    } else {
      return dbq.updateLink(discordID, osuName);
    }
  });
};

commands.givePP = () => {
  const lucky = Math.round(Math.random() * 11);

  if (lucky === 0) {
    return '[https://osu.ppy.sh/b/219311 Muryoku P - Existence [appearance AR9]]: 958pp | 95: 952pp | 98: 965pp | 99: 998pp | 100: 1002pp | 2:30 ★ 8.32 ♫ 290 AR9';
  } else if (lucky == 1) {
    return "[https://osu.ppy.sh/b/655679 Omoi - Snow Drive [Rabbit's Jumping Style]]: 782pp | 95: 775pp | 98: 783pp | 99: 792pp | 100: 799pp | 3:59 ★ 8.24 ♫ 224 AR9.7";
  } else if (lucky == 2) {
    return '[https://osu.ppy.sh/b/553082 ZOGRAPHOS (Yu Asahina+Yamajet) - Verse IV [DoKo]]: 755pp | 95: 745pp | 98: 759pp | 99: 768pp | 100: 782pp | 1:59 ★ 8.05 ♫ 212 AR9.6';
  } else if (lucky == 3) {
    return '[https://osu.ppy.sh/b/529432 Kagamine Rin & Len - Transformation [DoKo]]: 722pp | 95: 695pp | 98: 709pp | 99: 723pp | 100: 733pp | 2:27 ★ 7.96 ♫ 248 AR10';
  } else if (lucky == 4) {
    return '[https://osu.ppy.sh/b/460501 Various Artists - osu! ~ Death Stream Compilation 3 [Marathon]]: 778pp | 95: 755pp | 98: 768pp | 99: 779pp | 100: 792pp | 5:42 ★ 7.95 ♫ 185 AR10';
  } else if (lucky == 5) {
    return '[https://osu.ppy.sh/b/465543 The Quick Brown Fox - Shut Down Everything [490 Style]]: 705pp | 95: 689pp | 98: 700pp | 99: 708pp | 100: 715pp | 2:04 ★ 7.89 ♫ 220 AR10';
  } else if (lucky == 6) {
    return '[https://osu.ppy.sh/b/129891 xi - FREEDOM DiVE [FOUR DIMENSIONS]]: -15pp | 95: 463pp | 98: 497pp | 99: 516pp | 100: 540pp | 4:17 ★ 7.07 ♫ 222.22 AR9';
  } else if (lucky == 7) {
    return "[https://osu.ppy.sh/b/131891 The Quick Brown Fox - The Big Black [WHO'S AFRAID OF THE BIG BLACK]]: 0pp | 95: 283pp | 98: 298pp | 99: 308pp | 100: 322pp | 2:18 ★ 6.58 ♫ 360.3 AR10";
  } else if (lucky == 8) {
    return '[https://osu.ppy.sh/b/236344 Zedd - Clarity feat. Foxes (IOSYS uno DENPA Remix) [Insane]]: 172pp | 95: 129pp | 98: 148pp | 99: 162pp | 100: 183pp | 3:32 ★ 5.02 ♫ 200 AR9';
  } else if (lucky == 9) {
    return '[https://osu.ppy.sh/b/62297 Tachibana Miya - Miya to Tengoku to Jigoku [Baka]]: 420pp | 95: 1pp | 98: 2pp | 99: 2pp | 100: 4pp | 1:39 ★ 1.11 ♫ 195 AR2';
  } else if (lucky == 10) {
    return '[https://osu.ppy.sh/b/735272 TATOE TATOE - TATOE TATOE TATOE [TATOE]]: TATOE | 95: TATOE | 98: TATOE | 99: TATOE | 100: TATOE | TATOE ★ TATOE ♫ TATOE AR TATOE';
  } else if (lucky == 11) {
    return "[https://osu.ppy.sh/b/372245 Knife Party - Centipede [This isn't a map, just a simple visualization]]: 1337pp | 95: 5548 | 98: 5785 | 99: 5998 | 100: 6001 | 45.69 ★ 2:16 ♫ 560 AR10";
  }
};

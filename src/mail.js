"use strict";
/*
Mail Module
Keeps track of sent messages to other uses and delivers them as players
come online.  Also manages one-time send lists and other things like that.
*/
var mail = exports;

var storage = require('node-persist');

mail.init = ()=>{
  storage.initSync();
};

mail.escape = input=>{
  return input.replace(/ |-|'|"|`/gi, "_").replace(/\+|@/gi, "");
};

mail.send = (from, recip, message, client)=>{
  return new Promise((f,r)=>{
    var mailbox = storage.getItem(`mailbox-${mail.escape(recip)}`);

    if(typeof(mailbox) == "undefined"){
      mailbox = {new: [], old: []};
    }

    var sent = false;
    Object.keys(client.chans["#osu"].users).forEach(user=>{
      if(mail.escape(user.toLowerCase()) == recip.toLowerCase().replace(/ |-|'|"|`/gi, "_")){
        client.say(recip, `New message from ${from}: ${message}`);
        mailbox.old.push({from: from, message: message});
        console.log(`delivering mail to ${recip}: ${message}`);

        client.say(from, `Message successfuly sent to ${recip}.`);
        console.log(`Message sent to ${from}: Message successfuly sent to ${recip}.`);
        storage.setItem(`mailbox-${recip}`, mailbox);
        sent = true;
      }
    });

    if(!sent){
      var queued = mailbox.new.filter(newMessage=>{
        return newMessage.from == from;
      });

      if(queued.length < 5){
        mailbox.new.push({from: from, message: message});
        storage.setItem(`mailbox-${recip}`, mailbox);
        f(`Message saved and will be delivered when ${recip} next comes online.`);
      }else{
        f("You have too many undelivered messages for this user.  Wait for them to be viewed before sending more.");
      }
    }
  });
};

mail.check = (client, username)=>{
  var mailbox = storage.getItem(`mailbox-${mail.escape(username)}`);

  if(typeof(mailbox) != "undefined" && mailbox.new.length > 0){
    mail.deliver(mailbox, username, client);
  }
};

mail.deliver = (mailbox, username, client)=>{
  var i=0;
  mailbox.new.forEach(newMessage=>{
    mailbox.old.push(newMessage);
    setTimeout(()=>{
      client.say(username, `New message from ${newMessage.from}: ${newMessage.message}`);
      console.log(`delivering mail to ${username}: ${newMessage.message}`);
      i++;
    }, i * 1000); //queue up the messages one second apart
  });

  mailbox.new = [];

  storage.setItem(`mailbox-${username}`, mailbox);
};

mail.startupDeliver = client=>{
  var userlist = client.chans["#osu"].users;

  storage.keys().forEach(key=>{
    var split = key.split("-");
    var username = split[1];
    var message = key.split(username)[1]; //in case there are other dashes in username

    if(split[0] == "mailbox"){ //key is a mailbox
      var mailbox = storage.getItem(key);
      if(mailbox.new.length > 0){ //mailbox has new messages
        Object.keys(userlist).forEach(user=>{
          if(mail.escape(user.toLowerCase()) == split[1].toLowerCase().replace(/ |-|'|"|`/gi, "_")){
            mail.deliver(mailbox, split[1], client);
          }
        });
      }
    }
  });
};

/*
Mailbox Schema

{ new: [
  { from: "Ameo", message: "Hello from me to you!" }
  ], old: [ ... ]
]}

New messages are delivered to `new` and moved to `old` once delivered.
*/

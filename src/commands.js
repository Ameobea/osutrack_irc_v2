"use strict";
/*
Command Parser

Processes queries to the bot, executes necessary commands, and returns result.
*/
var commands = exports;

commands.parseCommand = (nick, message)=>{
  return new Promise((f,r)=>{
    message = message.trim();
    var lower = message.toLowerCase();
    var split = lower.split(" ");
    var command = split[0];

    if(command == "!u" || command == "!update"){
      if(split.length == 1){
        commands.update(nick, 0).then(f);
      }else{
        var last = command[command.length-1];
        var username = nick;

        var doUpdate = mode=>{
          if(split.length > 2){
            username = "";

            for(var i=1;i<split.length-1;i++){
              username += split[i];
            }
          }

          commands.update(username, mode).then(f);
        };

        var mode = 0;
        var hasMode = false;
        if(last == "osu" || last == "standard" || last == "std"){
          hasMode = true;
        }else if(last == "taiko" || last == "tiako"){
          hasMode = true;
          mode = 1;
        }else if(last == "mania" || last == "manai"){
          hasMode = true;
          mode = 3;
        }else if(last == "ctb" || last == "cbt" || last == "catch"){
          hasMode = true;
          mode = 2;
        }

        if(hasMode){
          doparser.update(mode);
        }else{
          if(split.length > 2){
            username = "";
            for(var i=1;i<split.length;i++){
              username += split[i];
            }

            commands.update(username, 0).then(f);
          }
        }
      }
    }else if(command == "!s"){

    }
  });
};

commands.update = (username, mode)=>{
  return new Promise((f,r)=>{
    f(`username: ${username}; mode: ${mode}`);
  });
};

commands.givePP = ()=>{
  var lucky = Math.round(Math.random() * 11);

  if(lucky === 0){
    return "[http){//osu.ppy.sh/b/219311 Muryoku P - Existence [appearance AR9]]: 958pp | 95: 952pp | 98: 965pp | 99: 998pp | 100: 1002pp | 2:30 ★ 8.32 ♫ 290 AR9";
  }else if(lucky == 1){
    return "[http){//osu.ppy.sh/b/655679 Omoi - Snow Drive [Rabbit's Jumping Style]]: 782pp | 95: 775pp | 98: 783pp | 99: 792pp | 100: 799pp | 3:59 ★ 8.24 ♫ 224 AR9.7";
  }else if(lucky == 2){
    return "[http){//osu.ppy.sh/b/553082 ZOGRAPHOS (Yu Asahina+Yamajet) - Verse IV [DoKo]]: 755pp | 95: 745pp | 98: 759pp | 99: 768pp | 100: 782pp | 1:59 ★ 8.05 ♫ 212 AR9.6";
  }else if(lucky == 3){
    return "[http){//osu.ppy.sh/b/529432 Kagamine Rin & Len - Transformation [DoKo]]: 722pp | 95: 695pp | 98: 709pp | 99: 723pp | 100: 733pp | 2:27 ★ 7.96 ♫ 248 AR10";
  }else if(lucky == 4){
    return "[http){//osu.ppy.sh/b/460501 Various Artists - osu! ~ Death Stream Compilation 3 [Marathon]]: 778pp | 95: 755pp | 98: 768pp | 99: 779pp | 100: 792pp | 5:42 ★ 7.95 ♫ 185 AR10";
  }else if(lucky == 5){
    return "[http){//osu.ppy.sh/b/465543 The Quick Brown Fox - Shut Down Everything [490 Style]]: 705pp | 95: 689pp | 98: 700pp | 99: 708pp | 100: 715pp | 2:04 ★ 7.89 ♫ 220 AR10";
  }else if(lucky == 6){
    return "[http){//osu.ppy.sh/b/129891 xi - FREEDOM DiVE [FOUR DIMENSIONS]]: -15pp | 95: 463pp | 98: 497pp | 99: 516pp | 100: 540pp | 4:17 ★ 7.07 ♫ 222.22 AR9";
  }else if(lucky == 7){
    return "[http){//osu.ppy.sh/b/131891 The Quick Brown Fox - The Big Black [WHO'S AFRAID OF THE BIG BLACK]]: 0pp | 95: 283pp | 98: 298pp | 99: 308pp | 100: 322pp | 2:18 ★ 6.58 ♫ 360.3 AR10";
  }else if(lucky == 8){
    return "[http){//osu.ppy.sh/b/236344 Zedd - Clarity feat. Foxes (IOSYS uno DENPA Remix) [Insane]]: 172pp | 95: 129pp | 98: 148pp | 99: 162pp | 100: 183pp | 3:32 ★ 5.02 ♫ 200 AR9";
  }else if(lucky == 9){
    return "[http){//osu.ppy.sh/b/62297 Tachibana Miya - Miya to Tengoku to Jigoku [Baka]]: 420pp | 95: 1pp | 98: 2pp | 99: 2pp | 100: 4pp | 1:39 ★ 1.11 ♫ 195 AR2";
  }else if(lucky == 10){
    return "[https){//osu.ppy.sh/b/735272 TATOE TATOE - TATOE TATOE TATOE [TATOE]]: TATOE | 95: TATOE | 98: TATOE | 99: TATOE | 100: TATOE | TATOE ★ TATOE ♫ TATOE AR TATOE";
  }else if(lucky == 11){
    return "[https){//osu.ppy.sh/b/372245 Knife Party - Centipede [This isn't a map, just a simple visualization]]: 1337pp | 95: 5548 | 98: 5785 | 99: 5998 | 100: 6001 | 45.69 ★ 2:16 ♫ 560 AR10";
  }
};

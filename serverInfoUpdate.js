const Discord = require('discord.js');
const client = new Discord.Client();
const data = require("./serverInfoUpdateChannels.json");
typeof data;
var fs = require('fs');
var prefix = '.'

var toShutDown = true


client.on('ready', async () => {
  console.log('Notifications bot has started.');
  process.setMaxListeners(20);
  if(toShutDown == true){
    await sendOnlineNotifications();
    console.log('Notifications bot has done its work and shuts down.');
    setTimeout(function(){
        client.destroy();
    }, 500);
  }
});

client.on('message', message => {
  if(message.author === client.user) return;
  //data = require("./serverInfoUpdateChannels.json");
  if(message.content == prefix + "addChannel"){
    //if(message.author.id === message.guild.owner.id){}           /maybe
    addChannel(message);
  }
  if(message.content.startsWith(prefix + "setDeleting")){
    changeDeletingMessages(message);
  }
  if(message.content.startsWith(prefix + "setStateChannel")){
    changeStateChannel(message);
  }
  if(message.content == prefix + "sendOnlineNotifications"){
    sendOnlineNotifications();
  }
});

function addChannel(message){
  //console.log(data)
  if(data[message.guild.id] == undefined || data[message.guild.id][message.channel.id] == undefined){
    addGuild(message.guild.id, message.channel.id, undefined);
    message.channel.send("✅ Channel has been successfully added.")
  }
  else{
    message.channel.send("⚠️ This channel has already been added.")
  }
}

async function addGuild(g, c, m){
  if(!data[g]){
    data[g] = {}
  }
  if(!data[g][c]){
    data[g][c] = {
      "message": m,
      "deleteMessages": false,
      "stateChannel": false
    }
  }
  fs.writeFileSync('./serverInfoUpdateChannels.json', JSON.stringify(data, null, 2), err => {
      if (err) throw err
  });
}

function changeDeletingMessages(message){
  let g = message.guild.id
  let c = [message.channel.id]
  if(data[g][c] == undefined){
    message.channel.send("⚠️ Please, use **.addChannel** first.");
  }
  else{
    args = [];
    args = message.content.split(' ');
    toggle = undefined;
    if(args.length!=2){
      message.channel.send("⚠️ Using: **.setDeleting <true/false>**");
    }
    if(args[1] == "true"){
      toggle = true
    }
    else if(args[1] == "false"){
      toggle = false
    }
    else{
      message.channel.send("⚠️ Using: **.setDeleting <true/false>**")
    }
    if(toggle != undefined){
      data[g][c].deleteMessages = toggle
      fs.writeFileSync('./serverInfoUpdateChannels.json', JSON.stringify(data, null, 2), err => {
          if (err) throw err
      });
    }
    message.channel.send(`✅ Now deleting notifications is set to ${toggle}.`)
  }
}

function changeStateChannel(message){
  let g = message.guild.id
  let c = [message.channel.id]
  if(data[g][c] == undefined){
    message.channel.send("⚠️ Please, use **.addChannel** first.");
  }
  else{
    args = [];
    args = message.content.split(' ');
    toggle = undefined;
    if(args.length!=2){
      message.channel.send("⚠️ Using: **.setStateChannel <true/false>**");
    }
    if(args[1] == "true"){
      toggle = true
    }
    else if(args[1] == "false"){
      toggle = false
    }
    else{
      message.channel.send("⚠️ Using: **.setStateChannel <true/false>**")
    }
    if(toggle != undefined){
      data[g][c].stateChannel = toggle
      fs.writeFileSync('./serverInfoUpdateChannels.json', JSON.stringify(data, null, 2), err => {
          if (err) throw err
      });
    }
    message.channel.send(`✅ Now sending state notifications in this channel is set to ${toggle}.`)
  }
}

function sendOnlineNotifications(){
  var channelId;
  var messsageId;
  Object.keys(data).forEach(async g => {
  if(data[g] != undefined){
    Object.keys(data[g]).forEach(async c => {
      const emojiOn = client.emojis.cache.get("793418187949342740")
      const emojiOff = client.emojis.cache.get("793418209831288863")
      const emojiBukkit = client.emojis.cache.get("800277048396480522")
      const emojiSpigot = client.emojis.cache.get("800279044822138900")
      const emojiPaper = client.emojis.cache.get("800277066229874688")
      let name = getDataFromProps("name")
      let description = getDataFromProps("description")
      let state = getDataFromProps("state")
      let time = getDataFromProps("time")
      let thePort = getDataFromProps("server-port")
      let hasAvatar = getDataFromProps("avatar")
      let serverVersion = getDataFromProps("server-version")
      let mcVersion = getDataFromProps("mc-version")
      if(state == "Offline" && data[g][c].stateChannel == true){ //offline state
        const newEmbed = await new Discord.MessageEmbed()
         .setTitle('Server information')
         //.setDescription(`${emoji} Greenem SMP`) //editable
        //.setAuthor('Server 7')
        .addFields(
          { name: 'State:', value: `${emojiOff} ${state}`}, //editable
        )
         .setTimestamp()
         .setFooter('Minecraft servers notifications by Greenem');
        try{
        if(data[g][c].message && data[g][c].message!=undefined){
          if(data[g][c].deleteMessages == true || data[g][c].stateChannel == true){
            await client.guilds.cache.get(g).channels.cache.get(c).messages.fetch(data[g][c].message)
              .then(async msg => msg.delete());
          }
        }
        }
        catch(err){
          //just it already got deleted, ignore it
        }
        sent = await client.guilds.cache.get(g).channels.cache.get(c).send(newEmbed)
        data[g][c].message = sent.id
        fs.writeFileSync('./serverInfoUpdateChannels.json', JSON.stringify(data, null, 2), err => {
            if (err) throw err
        });
      }
      else{
        // normal state

        //https://static.wikia.nocookie.net/minecraft_gamepedia/images/f/f2/Unknown_server.png/revision/latest/scale-to-width-down/120?cb=20200929054425
        var stateEmoji = emojiOff
        if(state == "Online"){
          stateEmoji = emojiOn
        }
        var finalServerCoreAndVersionString = serverVersion
        if(serverVersion == "Bukkit"){
          var coreEmoji = emojiBukkit
          finalServerCoreAndVersionString = `${coreEmoji} ${finalServerCoreAndVersionString}`
        }
        if(serverVersion == "Spigot"){
          var coreEmoji = emojiSpigot
            finalServerCoreAndVersionString = `${coreEmoji} ${finalServerCoreAndVersionString}`
        }
        if(serverVersion == "Paper"){
          var coreEmoji = emojiPaper
          finalServerCoreAndVersionString = `${coreEmoji} ${finalServerCoreAndVersionString}`
        }
        if(hasAvatar == true){
          avatarDir = "G:\\FishBot\\minecraft\\icon.png"
          attImage = "attachment://icon.png"
        }
        else{
          avatarDir = "G:\\FishBot\\minecraft\\default_icon.png"
          attImage = "attachment://default_icon.png"
        }
        //await client.guilds.cache.get(g).channels.cache.get(c).send(hasAvatar == true)
        const newEmbed = await new Discord.MessageEmbed()
        .setTitle('Server information')
        //.setDescription(`${emoji} Greenem SMP`) //editable
        //.setAuthor('Server 7')
        .addFields(
          { name: 'Name', value: `${name}` }, //editable
          { name: 'Description', value: `${description}` }, //editable
          { name: 'State:', value: `${stateEmoji} ${state}`}, //editable
          { name: 'Time:', value: `${time}`}, //editable
          { name: 'Port', value: `${thePort}`}, //editable
          { name: 'Server type', value: `${finalServerCoreAndVersionString}`}, //editable
          { name: 'Minecraft version', value: `${mcVersion}`}, //editable
          //{ name: '\u200B', value: '\u200B' },
          { name: '\u200B', value: '**Server icon:**' },
        )
        //.setImage(`${icon}`)
        .attachFiles(avatarDir)
        .setImage(attImage)
        //.addField('Name', 'Greenem SMP', true) //editable
        .setTimestamp()
        .setFooter('Minecraft servers notifications by Greenem');
       try{
         if(data[g][c].message && data[g][c].message!=undefined){
           if(data[g][c].deleteMessages == true || data[g][c].stateChannel == true){
             await client.guilds.cache.get(g).channels.cache.get(c).messages.fetch(data[g][c].message)
             .then(async msg => msg.delete());
           }
         }
       }
       catch(err){
         //just it already got deleted, ignore it
       }
       sent = await client.guilds.cache.get(g).channels.cache.get(c).send(newEmbed)
       data[g][c].message = sent.id
       fs.writeFileSync('./serverInfoUpdateChannels.json', JSON.stringify(data, null, 2), err => {
            if (err) throw err
          });
        }
      })
    }
  })
}

function onErrorGetting(message, err){
  message.channel.send("💥An unexpected error occurred.")
}

function getDataFromProps(name) {
  var propertiesReader = require('properties-reader');
  var properties = propertiesReader('G:\\FishBot\\minecraft\\mcServerInfo.properties');
  var data = properties.get(name);
  //message.channel.send(`server name in the file is **${serverName}**.`)
  return data
}














































client.login("NzU4Njg0NDE1MDQzMDQzNDMy.X2yh7A.gAi5T3zoz365uj76-IYzDGJ8OZs")

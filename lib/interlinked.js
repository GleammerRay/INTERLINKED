import * as fs from 'fs';
import * as webtoys from './webtoys.js';
import { REST, Gateway } from './gleamcord.js';
import { queryGameServerInfo, queryGameServerPlayer } from 'steam-server-query';
import { createHash } from 'crypto';

const defaultLogoURL = 'https://github.com/GleammerRay/INTERLINKED/blob/main/assets/logo.png?raw=true';
const defaultGameListURL = 'https://raw.githubusercontent.com/UndeadGames/undeadgames.github.io/main/undeadgames.json';
const steamPingRate = 30000;
const checkIsRunningRate = 500;
const defaultMinPlayerCount = 1;
const defaultPingMinRate = 3600000; // 1 hour
const defaultPingMinPlayerCount = 2;
const defaultSubscriptionFeedMinRate = 1800000; // 30 minutes
const defaultMaxServerCount = 5;
const maxBlacklistLength = 99;
const helpDesc = 'List all available commands';
const updateDesc = 'Get a list of active game servers';
const pubDesc = 'Add ping role for user';
const unpubDesc = 'Remove ping role for user';
const getDesc = 'Get an INTERLINKED variable';
const getAllDesc = 'List all INTERLINKED variables';
const resetDesc = 'Reset an INTERLINKED variable'
const resetAllDesc = 'Reset all INTERLINKED variables for this guild';
const setDesc = 'Set an INTERLINKED variable for this guild';
const adminRoleDesc = 'Role that has access to INTERLINKED admin-only commands';
const maxServerCountDesc = 'Maximum number of servers in the server list';
const subscribedChannelsDesc = 'Channels subscribed to automatic game updates'
const minPlayerCountDesc = 'Minimum player count to trigger suscription feed';
const subscriptionFeedMinRateDesc = 'Minimum time between two automatic updates';
const pingRoleDesc = 'Role that that is pinged about active game servers';
const pingMinRateDesc = 'Minimum time between two pings';
const pingMinPlayerCountDesc = 'Minimum player count to trigger ping';
const subscribeDesc = 'Subscribe channel to receive automatic updates about active game servers';
const unsubscribeDesc = 'Unsubscribe channel from receiving automatic updates about active game servers';
const blacklistDesc = 'Blacklist a server from the servers list';
const unblacklistDesc = 'Unblacklist a server from the servers list';
const addressDesc = 'Server address in format <ip>:<port>';
const getBlacklistDesc = 'Blacklisted servers';
const serverListDesc = 'Create a message that will show live info from up to 15 servers';
const gameListDesc = 'Create message(s) that will show info from Undead Games Hub';
const commands = ('[' +
'{' + 
  `"name":"help","type":1,"description":"${helpDesc}"` +
'},' +
'{' +
  `"name":"update","type":1,"description":"${updateDesc}"` +
'},' +
'{' +
  `"name":"pub","type":1,"description":"${pubDesc}","dm_permission":false` +
'},' +
'{' +
  `"name":"unpub","type":1,"description":"${unpubDesc}","dm_permission":false` +
'},' +
'{' +
  `"name":"get","type":1,"description":"${getDesc}","dm_permission":false,"options":[` +
    `{"name":"all","type":1,"dm_permission":false,"description":"${getAllDesc}"},` +
    `{"name":"admin_role","type":1,"dm_permission":false,"description":"${adminRoleDesc}"},` +
    `{"name":"max_server_count","type":1,"dm_permission":false,"description":"${maxServerCountDesc}"},` +
    `{"name":"subscribed_channels","type":1,"dm_permission":false,"description":"${subscribedChannelsDesc}"},` +
    `{"name":"min_player_count","type":1,"dm_permission":false,"description":"${minPlayerCountDesc}"},` +
    `{"name":"subscription_feed_min_rate","type":1,"dm_permission":false,"description":"${subscriptionFeedMinRateDesc}"},` + 
    `{"name":"ping_role","type":1,"dm_permission":false,"description":"${pingRoleDesc}"},` +
    `{"name":"ping_min_rate","type":1,"dm_permission":false,"description":"${pingMinRateDesc}"},` +
    `{"name":"ping_min_player_count","type":1,"dm_permission":false,"description":"${pingMinPlayerCountDesc}"},` +
    `{"name":"blacklist","type":1,"dm_permission":false,"description":"${getBlacklistDesc}"}` +
  ']' +
'},' +
'{' +
  `"name":"reset","type":1,"description":"${resetDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false,"options":[` +
    `{"name":"all","type":1,"dm_permission":false,"description":"${resetAllDesc}"},` +
    `{"name":"admin_role","type":1,"dm_permission":false,"description":"${adminRoleDesc}"},` +
    `{"name":"max_server_count","type":1,"dm_permission":false,"description":"${maxServerCountDesc}"},` +
    `{"name":"subscribed_channels","type":1,"dm_permission":false,"description":"${subscribedChannelsDesc}"},` +
    `{"name":"min_player_count","type":1,"dm_permission":false,"description":"${minPlayerCountDesc}"},` +
    `{"name":"subscription_feed_min_rate","type":1,"dm_permission":false,"description":"${subscriptionFeedMinRateDesc}"},` + 
    `{"name":"ping_role","type":1,"dm_permission":false,"description":"${pingRoleDesc}"},` +
    `{"name":"ping_min_rate","type":1,"dm_permission":false,"description":"${pingMinRateDesc}"},` +
    `{"name":"ping_min_player_count","type":1,"dm_permission":false,"description":"${pingMinPlayerCountDesc}"},` +
    `{"name":"blacklist","type":1,"dm_permission":false,"description":"${getBlacklistDesc}"}` +
  ']' +
'},' +
'{' +
  `"name":"set","type":1,"description":"${setDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false,"options":[` +
    `{"name":"admin_role","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${adminRoleDesc}","options":[{"name":"role","type":8,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Admin role"}]},` +
    `{"name":"max_server_count","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${maxServerCountDesc}","options":[{"name":"count","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Maximum server count (default: 5)"}]},` +
    `{"name":"min_player_count","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${minPlayerCountDesc}","options":[{"name":"count","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Minimum player count (default: 1)"}]},` +
    `{"name":"subscription_feed_min_rate","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${subscriptionFeedMinRateDesc}","options":[{"name":"rate","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Subscription feed minimum rate (in milliseconds, default: 1800000)"}]},` + 
    `{"name":"ping_role","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${pingRoleDesc}","options":[{"name":"role","type":8,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Role to be pinged"}]},` +
    `{"name":"ping_min_rate","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${pingMinRateDesc}","options":[{"name":"rate","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Ping minimum rate in (in milliseconds, default: 3600000)"}]},` +
    `{"name":"ping_min_player_count","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${pingMinPlayerCountDesc}","options":[{"name":"count","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Minimum ping player count (default: 2)"}]}` +
  ']' +
'},' +
'{' +
  `"name":"subscribe","type":1,"description":"${subscribeDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false` +
'},' +
'{' +
  `"name":"unsubscribe","type":1,"description":"${unsubscribeDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false` + 
'},' + 
'{' +
  `"name":"blacklist","type":1,"description":"${blacklistDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false,"options":[` +
    `{"name":"address","type":3,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description":"${addressDesc}"}` +
  ']' +
'},' +
'{' +
  `"name":"unblacklist","type":1,"description":"${unblacklistDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false,"options":[` +
    `{"name":"address","type":3,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description":"${addressDesc}"}` +
  ']' +
'},' +
'{' +
  `"name":"server_list","type":1,"description":"${serverListDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false` +
'},' +
'{' +
  `"name":"game_list","type":1,"description":"${gameListDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false` +
'}' +
']');

const adminHelpField = '{"name":"Admin commands","value":"'+
`\`/reset\` - ${resetDesc}\\n` +
`\`/set\` - ${setDesc}\\n` +
`\`/subscribe\` - ${subscribeDesc}\\n` +
`\`/unsubscribe\` - ${unsubscribeDesc}\\n` +
`\`/blacklist\` - ${blacklistDesc}\\n` +
`\`/unblacklist\` - ${unblacklistDesc}\\n` +
`\`/server_list\` - ${serverListDesc}\\n` +
`\`/game_list\` - ${gameListDesc}` +
'"}';

const serverListComponents = '[' +
'{' +
'"type":1,' +
'"components":' +
'[' +
  '{' +
    '"type":2,' +
    '"custom_id":"list_players",' +
    '"label":"Show players",' +
    '"style":2,' +
    '"emoji":{' +
      '"id":null,' +
      '"name":"👥"' +
    '}' +
  '}' +
']' +
'}' +
']';

function getHelpMsg(isAdmin = false, logoURL = defaultLogoURL) {
  var _adminHelpField = '';
  if (isAdmin) _adminHelpField = adminHelpField;
  return (`{"type":4,"data":{"flags":${1 << 6},"embeds":[{` +
  '"title":"Command list",' +
  '"footer":{' +
    '"icon_url":"https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg",' +
    '"text":"Made by Gleammer (nice)"' +
  '},' +
  '"thumbnail":{"url":"https://media.discordapp.net/attachments/1005272489380827199/1005580343270719530/logo.png"},' +
  `"author":{"name":"INTERLINKED","url":"https://github.com/GleammerRay/INTERLINKED","icon_url":"${logoURL}" },` +
  '"description":"'+
`\`/help\` - ${helpDesc}\\n` +
`\`/update\` - ${updateDesc}\\n` +
`\`/pub\` - ${pubDesc}\\n` +
`\`/unpub\` - ${unpubDesc}\\n` +
`\`/get\` - ${getDesc}` +
  '",' +
  `"fields":[${_adminHelpField}]` +
'}]}}');
}

function snakeToCamelCase(str) {
  return str.replace(/_[a-z]/g, m => m[1].toUpperCase());
}

function isFriday(date) {
  return date.getDay() == 5;
}

function isAdmin(member) {
  return (member.permissions & (1 << 3)) == (1 << 3);
}

function ranInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getListString(list) {
  var _listString = '['; 
  if (list.length != 0) {
    _listString += '\\n';
  }
  for (var i = 0; i != list.length; i++) {
    var _var = list[i];
    _listString += `> ${_var}\\n`;
  }
  _listString += ']';
  return _listString;
}
  
function getChannelsString(channels) {
  var _channelsString = '['; 
  if (channels.length != 0) {
    _channelsString += '\\n';
  }
  for (var i = 0; i != channels.length; i++) {
    var _channel = channels[i];
    _channelsString += `> <#${_channel}>\\n`;
  }
  _channelsString += ']';
  return _channelsString;
}

function getImage(images) {
  if (images == null) return;
  if (images.length == 0) return;
  var _index = ranInt(0, images.length - 1);
  return images[_index];
}

async function queryServerInfo(address) {
  try {
    return await queryGameServerInfo(address);
  } catch (e) {
    return null;
  }
}

async function queryServerPlayers(address) {
  try {
    return await queryGameServerPlayer(address);
  } catch (e) {
    return null;
  }
}

async function queryServer(address) {
  try {
    var info = queryServerInfo(address);
    var playerInfo = queryServerPlayers(address);
    info = await info;
    playerInfo = await playerInfo;
    info.playerInfo = playerInfo;
    return info;
  } catch (e) {
    return null;
  }
}

class InterlinkedImages {
  activeImageURLs;
  fridayImageURLs;
  mapImageURLs;
  
  constructor(activeImageURLs = [], fridayImageURLs = [], mapImageURLs = {}) {
    this.activeImageURLs = activeImageURLs;
    this.fridayImageURLs = fridayImageURLs;
    this.mapImageURLs = mapImageURLs;
  } 
}

export class InterlinkedServer {

  constructor(address, name, mapName, players, playerCount, maxPlayerCount) {
    this.address = address;
    this.name = name;
    this.mapName = mapName;
    if (players == null) players = [];
    this.players = players;
    this.playerCount = playerCount;
    this.maxPlayerCount = maxPlayerCount;
  }
  
  static fromSteamServer(server) {
    if (server.playerInfo == null) server.playerInfo = {};
    return new InterlinkedServer(server.addr, server.name, server.map, server.playerInfo.players, server.players, server.max_players);
  }
}

export class InterlinkedServerList {
  servers;
  activeServers;
  serverCount;
  playerCount;

  constructor(servers = {}, activeServers = [], serverCount = 0, playerCount = 0) {
    this.servers = servers;
    this.activeServers = activeServers;
    this.serverCount = serverCount;
    this.playerCount = playerCount;
  }
  
  static fromSteamServers(servers) {
    //servers = [{players: 2, addr: '74.91.116.227:27015', name: 'BonAHNSa.com || Fridays/Weekends 1900-2200 UTC', map: 'nt_envoy_ctg', max_players: 32}];
    var _allServers = {};
    var _servers = [];
    var _playerCount = 0;
    for (var i = 0; i != servers.length; i++) {
      var _server = servers[i];
      if (_server.addr == null) continue;
      if (_server.name == null) continue;
      if (_server.map == null) continue;
      if (_server.max_players == null) continue;
      if (_server.players == null) continue;
      var _interlinkedServer = InterlinkedServer.fromSteamServer(_server);
      _allServers[_server.addr] = _interlinkedServer;
      if (_server.players == 0) continue;
      _playerCount += _server.players;
      var _position = _servers.length;
      for (var i2 = 0; i2 != _servers.length; i2++) {
        if (_server.players >= _servers[i2].playerCount) {
          _position = i2;
          break;
        }
      }
      _servers.splice(_position, 0, _interlinkedServer);
    }
    return new InterlinkedServerList(_allServers, _servers, servers.length, _playerCount);
  }
}

export class InterlinkedGameConnection {
  name;
  value;

  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  static fromJSON(json) {
    var name;
    var value;
    if (typeof json.name == 'string') name = json.name;
    else name = null;
    if (typeof json.value == 'string') value = json.value;
    else value = null;
    return new InterlinkedGameConnection(name, value);
  }

  toDiscordEmbedField() {
    var name = this.name;
    var value = this.value;
    if (name != null) {
      if (name.length == 0) name = 'null';
      else if (name.length > 100) name = name.slice(0, 100);
    }
    if (value != null) {
      if (value.length == 0) value = 'null';
      else if (value != null) if (value.length > 250) value = value.slice(0, 250);
    }
    return {
      name: name,
      value: value,
    };
  }
}

export class InterlinkedGame {
  name;
  logoURL;
  description;
  downloadPage;
  activity;
  connections;

  constructor(name, logoURL, bannerURL, description, downloadPage, activity, connections = []) {
    this.name = name;
    this.logoURL = logoURL;
    this.bannerURL = bannerURL;
    this.description = description;
    this.downloadPage = downloadPage;
    this.activity = activity;
    this.connections = connections;
  }

  static fromJSON(json) {
    var name;
    var logoURL;
    var bannerURL;
    var description;
    var downloadPage;
    var activity;
    var connections = [];
    if (typeof json.name == 'string') name = json.name;
    else name = null;
    if (typeof json.logoURL == 'string') logoURL = json.logoURL;
    else logoURL = null;
    if (typeof json.bannerURL == 'string') bannerURL = json.bannerURL;
    else bannerURL = null;
    if (typeof json.description == 'string') description = json.description;
    else description = null;
    if (typeof json.downloadPage == 'string') downloadPage = json.downloadPage;
    else downloadPage = null;
    if (typeof json.activity == 'string') activity = json.activity;
    else activity = null;
    if (Array.isArray(json.connections)) {
      for (let i = 0; i != json.connections.length; i++) {
        var connection = json.connections[i];
        connections.push(InterlinkedGameConnection.fromJSON(connection));
      }
    }
    return new InterlinkedGame(name, logoURL, bannerURL, description, downloadPage, activity, connections);
  }

  toDiscordMessage(color = null) {
    var name = this.name;
    var logoURL = this.logoURL;
    var bannerURL = this.bannerURL;
    var description = this.description;
    var downloadPage = this.downloadPage;
    var activity = this.activity;
    var connections = this.connections.map((connection) => connection.toDiscordEmbedField());
    if (name != null) {
      if (name.length == 0) name = 'null';
      else if (name.length > 100) name = name.slice(0, 100);  
    }
    if (logoURL != null) {
      if (logoURL.length == 0) logoURL = 'null';
      else if (logoURL.length > 250) logoURL = logoURL.slice(0, 250);
    }
    if (bannerURL != null) {
      if (bannerURL.length == 0) bannerURL = 'null';
      else if (bannerURL.length > 250) bannerURL = bannerURL.slice(0, 250);
    }
    if (description != null) {
      if (description.length == 0) description = 'null';
      else if (description.length > 800) description = description.slice(0, 800);
    }
    if (downloadPage != null) {
      if (downloadPage.length == 0) downloadPage = 'null';
      else if (downloadPage.length > 250) downloadPage = downloadPage.slice(0, 250);
    }
    if (activity != null) {
      if (activity.length == 0) activity = 'null';
      else if (activity.length > 250) activity = activity.slice(0, 250);
    }
    if (connections.length > 10) connections.splice(10);
    return {
      embeds: [
        {
          title: name,
          thumbnail: { url: logoURL },
          image: { url: bannerURL },
          description: description,
          color: this.color,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: 'Download page',
              value: downloadPage,
            },
            {
              name: 'Activity',
              value: activity,
            },
            ...connections,
          ],
        },
      ],
    };
  }
}

export class InterlinkedGameList {
  name;
  websiteURL;
  discordURL;
  logoURL;
  bannerURL;
  color;
  games;

  constructor(name = '', websiteURL = '', discordURL = '', logoURL = null, bannerURL = null, color = null, games = []) {
    if (name != null) if (name.length > 100) name = name.slice(0, 100);  
    this.name = name;
    if (websiteURL != null) if (websiteURL.length > 250) websiteURL = websiteURL.slice(0, 250);
    this.websiteURL = websiteURL;
    if (discordURL != null) if (discordURL.length > 250) discordURL = discordURL.slice(0, 250);
    this.discordURL = discordURL;
    if (logoURL != null) if (logoURL.length > 500) logoURL = logoURL.slice(0, 100);
    this.logoURL = logoURL;
    if (bannerURL != null) if (bannerURL.length > 500) bannerURL = bannerURL.slice(0, 100);
    this.bannerURL = bannerURL;
    this.color = color;
    this.games = games;
  }

  static fromJSON(json) {
    var name;
    var websiteURL;
    var discordURL;
    var logoURL;
    var bannerURL;
    var color;
    var games = [];
    if (typeof json.name == 'string') name = json.name;
    else name = null;
    if (typeof json.websiteURL == 'string') websiteURL = json.websiteURL;
    else websiteURL = null;
    if (typeof json.discordURL == 'string') discordURL = json.discordURL;
    else discordURL = null;
    if (typeof json.logoURL == 'string') logoURL = json.logoURL;
    else logoURL = null;
    if (typeof json.bannerURL == 'string') bannerURL = json.bannerURL;
    else bannerURL = null;
    if (typeof json.color == 'number') color = json.color;
    else color = null;
    if (Array.isArray(json.games)) {
      for (let i = 0; i != json.games.length; i++) {
        var game = json.games[i];
        games.push(InterlinkedGame.fromJSON(game));
      }
    }
    return new InterlinkedGameList(name, websiteURL, discordURL, logoURL, bannerURL, color, games)
  }

  static async fromURL(url = defaultGameListURL) {
    var rest = new REST();
    var response = await rest.get(url);
    if (typeof response != 'object') response = {};
    return InterlinkedGameList.fromJSON(response);
  }

  generateDiscordMessages() {
    var thumbnail;
    if (this.logoURL == null) thumbnail = null;
    else thumbnail = { url: this.logoURL };
    var image;
    if (this.bannerURL == null) image = null;
    else image = { url: this.bannerURL };
    var messages = [
      {
        embeds: [
          {
            author: {
              name: this.name,
              url: this.websiteURL,
              icon_url: this.logoURL,
            },
            title: 'Games list',
            thumbnail: thumbnail,
            description: `Live list of games in need of players, fetched from ${this.name}.\n\nService website: ${this.websiteURL}`,
            color: this.color,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ];
    if (this.discordURL != null) messages[0].embeds[0].description += `\nService Discord: ${this.discordURL}`;
    if (messages[0].embeds[0].description.length > 500) messages[0].embeds[0].description = messages[0].embeds[0].description.slice(0, 500);
    if (this.games.length == 0) messages[0].embeds[0].description += '\n\nFailed to fetch any games. 😓';
    for (let i = 0; i != this.games.length; i++) {
      var game = this.games[i];
      var message = game.toDiscordMessage();
      messages.push(message);
    }
    if (image != null) {
      messages.push({
        'content': image.url,
      });
    }
    return messages;
  }
}

export class InterlinkedGuild {
  gameName;
  maxServerCount;
  adminRole;
  logoURL;
    
  get subscribedChannels() {
    return this.#subscribedChannels;
  }
  set subscriptionFeedMinRate(value) {
    this.#subscriptionFeedMinRate = value;
    this.#canPostSubscriptionFeed = true;
    clearTimeout(this.#subscriptionFeedTimeoutID);
  }
  set minPlayerCount(value) {
    this.#minPlayerCount = value;
    this.#canPostSubscriptionFeed = true;
    clearTimeout(this.#subscriptionFeedTimeoutID);
  }
  get minPlayerCount() {
    return this.#minPlayerCount;
  }
  get subscriptionFeedMinRate() {
    return this.#subscriptionFeedMinRate;
  }
  set pingRole(value) {
    this.#pingRole = value;
    this.#canPing = true;
    clearTimeout(this.#pingTimeoutID);
  }
  get pingRole() {
    return this.#pingRole;
  }
  set pingMinRate(value) {
    this.#pingMinRate = value;
    this.#canPing = true;
    clearTimeout(this.#pingTimeoutID);
  }
  get pingMinRate() {
    return this.#pingMinRate;
  }
  set pingMinPlayerCount(value) {
    this.#pingMinPlayerCount = value;
    this.#canPing = true;
    clearTimeout(this.#pingTimeoutID);
  }
  get pingMinPlayerCount() {
    return this.#pingMinPlayerCount;
  }
  get blacklist() {
    return this.#blacklist;
  }
  
  #guildID;
  #rest;
  #images;
  #onLog;
  #canPostSubscriptionFeed;
  #subscribedChannels;
  #subscriptionFeedMinRate;
  #minPlayerCount;
  #canPing;
  #pingRole;
  #pingMinRate;
  #pingMinPlayerCount;
  #blacklist;
  #serverListChannelID;
  #serverListMessageID;
  #gameListChannelID;
  #gameListMessageIDs;
  #gameListHash;
  
  #subscriptionFeedTimeoutID;
  #pingTimeoutID;
  
  constructor(
    guildID,
    rest,
    gameName,
    images = new InterlinkedImages(),
    onLog = null,
    maxServerCount = defaultMaxServerCount,
    adminRole = null,
    subscribedChannels = [],
    subscriptionFeedMinRate = defaultSubscriptionFeedMinRate,
    minPlayerCount = defaultMinPlayerCount,    
    pingRole = null,
    pingMinRate = defaultPingMinRate,
    pingMinPlayerCount = defaultPingMinPlayerCount,
    blacklist = [],
    serverListChannelID = null,
    serverListMessageID = null,
    gameListChannelID = null,
    gameListMessageIDs = null,
    gameListHash = null,
    logoURL = defaultLogoURL,
  ) {
    this.gameName = gameName;
    this.maxServerCount = maxServerCount;
    this.adminRole = adminRole;
    this.logoURL = logoURL;
    
    this.#guildID = guildID;
    this.#rest = rest;
    this.#images = images;
    this.#onLog = onLog;
    this.#canPostSubscriptionFeed = true;
    this.#subscribedChannels = subscribedChannels;
    this.#subscriptionFeedMinRate = subscriptionFeedMinRate;
    this.#minPlayerCount = minPlayerCount;
    this.#canPing = true;
    this.#pingRole = pingRole;
    this.#pingMinRate = pingMinRate;
    this.#pingMinPlayerCount = pingMinPlayerCount;    
    this.#blacklist = blacklist;
    this.#serverListChannelID = serverListChannelID;
    this.#serverListMessageID = serverListMessageID;
    this.#gameListChannelID = gameListChannelID;
    this.#gameListMessageIDs = gameListMessageIDs;
    this.#gameListHash = gameListHash;
    
    this.#subscriptionFeedTimeoutID = null;
    this.#pingTimeoutID = null;
  }
  
  static fromJSON(json, rest, gameName, images = new InterlinkedImages(), onLog = null, logoURL = defaultLogoURL) {
    return new InterlinkedGuild(
      json.guildID,
      rest,
      gameName,
      images,
      onLog,
      json.maxServerCount == null ? defaultMaxServerCount : json.maxServerCount,
      json.adminRole,
      json.subscribedChannels == null ? [] : json.subscribedChannels,
      json.subscriptionFeedMinRate == null ? defaultSubscriptionFeedMinRate : json.subscriptionFeedMinRate,
      json.minPlayerCount == null ? defaultMinPlayerCount : json.minPlayerCount,
      json.pingRole,
      json.pingMinRate == null ? defaultPingMinRate : json.pingMinRate,
      json.pingMinPlayerCount == null ? defaultPingMinPlayerCount : json.pingMinPlayerCount,
      json.blacklist == null ? [] : json.blacklist,
      json.serverListChannelID,
      json.serverListMessageID,
      json.gameListChannelID,
      json.gameListMessageIDs,
      json.gameListHash,
      logoURL = logoURL,
    );
  }
  
  toJSON() {
    return {
      guildID: this.#guildID,
      maxServerCount: this.maxServerCount,
      adminRole: this.adminRole,
      subscribedChannels: this.#subscribedChannels,
      subscriptionFeedMinRate: this.#subscriptionFeedMinRate,
      minPlayerCount: this.#minPlayerCount,
      pingRole: this.#pingRole,
      pingMinRate: this.#pingMinRate,
      pingMinPlayerCount: this.#pingMinPlayerCount,
      blacklist: this.#blacklist,
      serverListChannelID: this.#serverListChannelID,
      serverListMessageID: this.#serverListMessageID,
      gameListChannelID: this.#gameListChannelID,
      gameListMessageIDs: this.#gameListMessageIDs,
      gameListHash: this.#gameListHash,
    }
  }
  
  _onLog(value) {
    if (this.#onLog != null) this.#onLog(value);
  }
  
  get guildID() {
    return this.#guildID;
  }
  
  getRoles() {
    return this.#rest.getGuildRoles(this.#guildID);
  }
  
  delayNextSubscriptionFeedUpdate() {
    clearTimeout(this.#subscriptionFeedTimeoutID);
    this.#canPostSubscriptionFeed = false;
    this.#subscriptionFeedTimeoutID = setTimeout(() => { this.#canPostSubscriptionFeed = true; }, this.#subscriptionFeedMinRate);
  }
  
  delayNextPing() {
    clearTimeout(this.#pingTimeoutID);
    this.#canPing = false;
    this.#pingTimeoutID = setTimeout(() => { this.#canPing = true; }, this.#pingMinRate);
  }
  
  shouldPing(serverList) {
    if (this.pingRole != null) {
      if (serverList.playerCount >= this.pingMinPlayerCount) {
        if (this.#canPing) {
          return true;
        }
      }
    }
    return false;
  }
  
  getMapImage(mapName) {
    if (mapName == null) return;
    if (this.#images.mapImageURLs == null) return;
    return this.#images.mapImageURLs[mapName];
  }
  
  getImage(mapName = null) {
    var _image = null;
    if (isFriday(new Date())) {
      _image = getImage(this.#images.fridayImageURLs);
      if (_image != null) return _image;
    }
    _image = this.getMapImage(mapName);
    if (_image != null) return _image;
    _image = getImage(this.#images.activeImageURLs);
    return _image;
  }

  _getImage(serverList) {
    if (serverList.playerCount >= this.#minPlayerCount) return this.getImage(serverList.activeServers.length == 0 ? null : serverList.activeServers[0].mapName);
  }

  static buildServerField(server) {
    return `{"name":"${server.playerCount == 0 ? ':red_circle:' : ':green_circle:'} ${server.name}","value":"Players: **${server.playerCount}/${server.maxPlayerCount}**\\nConnect: steam://connect/${server.address}\\nIP: \`${server.address}\`\\nMap: \`${server.mapName}\`"}`;
  }
  
  buildServerListMessage(serverList, image = null, showInactive = false, components = serverListComponents) {
    if (image == null) image = this._getImage(serverList);
    var _serverCount = serverList.serverCount;
    var _playerCount = serverList.playerCount;
    var _content = '';
    var _image = '';
    var _fields = [];
    var _descSuffix = '';
    var _addedServers = [];
    if (serverList.activeServers.length == 0) {
      _descSuffix = `\\n\\n🔴 No active servers. 🔴`
    }
    if (serverList.activeServers.length != 0) {
      _descSuffix = '\\n\\nActive servers:';
      for (var i = 0; (i != serverList.activeServers.length) && (i != 15); i++) {
        var _server = serverList.activeServers[i];
        _fields.push(InterlinkedGuild.buildServerField(_server));
        _addedServers.push(_server.address);
      }
    }
    if (showInactive) {
      var _servers = Object.values(serverList.servers);
      for (var i = 0; (i != _servers.length) && (_fields.length != 15); i++) {
        var _server = _servers[i];
        if (_addedServers.includes(_server.address)) continue;
        if (_server.playerCount != 0) continue;
        _fields.push(InterlinkedGuild.buildServerField(_server));
      }
    }
    if (_playerCount >= this.#minPlayerCount && image != null) {
      _image = `,"image":{"url":"${image}"}`;
    }
    if (showInactive) {
      if ((serverList.playerCount >= this.pingMinPlayerCount) && (this.pingRole != null)) _content = `,"content":"<@&${this.#pingRole}> :beers:"`;
      else _content = `,"content":"\u200E"`;
    } else {
      if (this.shouldPing(serverList)) {
        _content = `,"content":"<@&${this.#pingRole}> :beers:"`;
        this.delayNextPing();
      }
    }
    var _message = `{${components == null ? '' : '"components":' + components + ','}"embeds":[{"footer":{"icon_url": "https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg","text": "Made by Gleammer (nice)"},"thumbnail":{"url": "${this.logoURL}"},"author":{"name":"INTERLINKED","url":"https://github.com/GleammerRay/INTERLINKED","icon_url": "${this.logoURL}"},"title":"${this.gameName} servers list","description":"\\n:desktop: Online servers: ${_serverCount}\\n:hugging: Online players: ${_playerCount}${_descSuffix}","color":4592387,"timestamp":"${new Date().toISOString()}","fields":[${_fields.join(',')}]${_image}}]${_content}}`;
    return _message;
  }
  
  _getBlacklistedServerList(serverList) {
    var _serverList = new InterlinkedServerList(
      {},
      [],
      serverList.serverCount,
      0
    );
    var servers = Object.values(serverList.servers);
    for (var i = 0; (i != servers.length) || (_serverList.activeServers.length >= this.maxServerCount); i++) {
      var _server = servers[i];
      if (_server == null) break;
      if (!this.#blacklist.includes(_server.address)) {
        _serverList.servers[_server.address] = _server;
        if (_server.playerCount != 0) {
          _serverList.activeServers.push(_server);
          _serverList.playerCount += _server.playerCount;
        }
        continue;
      }
    }
    return _serverList;
  }
  
  async postServerListInteractionResponse(interaction, serverList, image = null) {
    serverList = this._getBlacklistedServerList(serverList);
    if (image == null) image = this._getImage(serverList);
    this._onLog(`I:Sending server list to channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    if (this.shouldPing(serverList)) {
      this.delayNextPing();
      await this.#rest.createMessage(interaction.channel_id, `{"content":"<@&${this.#pingRole}> :beers:"}`);
    }
    var _message = this.buildServerListMessage(serverList, image);
    return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":${_message}}`);
  }
  
  postServerListMessage(channelID, serverList, image = null, shouldBlacklist = true) {
    if (shouldBlacklist) serverList = this._getBlacklistedServerList(serverList);
    if (image == null) image = this._getImage(serverList);    
    var _message = this.buildServerListMessage(serverList, image);
    this._onLog(`I:Sending server list to channel ${channelID} in guild ${this.#guildID}.`);
    return this.#rest.createMessage(channelID, _message);
  }
  
  async postSubscriptionFeed(serverList, image = null) {
    serverList = this._getBlacklistedServerList(serverList);
    if (serverList.playerCount < this.#minPlayerCount) return;
    if (!this.#canPostSubscriptionFeed) return;      
    if (image == null) image = this._getImage(serverList);  
    this.delayNextSubscriptionFeedUpdate();
    for (var i = 0; i != this.#subscribedChannels.length; i++) {
      await this.postServerListMessage(this.#subscribedChannels[i], serverList, image, false);
    }
  }
  
  isAdmin(member) {
    return isAdmin(member) || member.roles.includes(this.adminRole);
  }
  
  listHelp(interaction) {
    if (interaction.user != null) {
      this._onLog(`I:Listing help for user ${interaction.user.id} in channel ${interaction.channel_id}.`);
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"embeds":[{"title":"Command list","description":"\`/help\` - ${helpDesc}\\n\`/update\` - ${updateDesc}\\n"}]}}`);
    }
    var _isAdmin = this.isAdmin(interaction.member);
    var _helpMsg = getHelpMsg(_isAdmin);
    this._onLog(`I:Listing help on channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    return this.#rest.createInteractionResponse(interaction, _helpMsg);
  }
  
  async addUserPingRole(interaction) {
    var _user = interaction.member.user;
    this._onLog(`I:Adding ping role to user ${_user.id} in guild ${interaction.guild_id}.`);
    if (this.#pingRole == null) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Ping role is not set up. :no_mouth:\\nUse \`/set ping_role\` first"}}`);
    }
    if (interaction.member.roles.indexOf(this.#pingRole) != -1) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"You already have the ping role. :upside_down:"}}`);
    }
    var _response = await this.#rest.addGuildMemberRole(interaction.guild_id, _user.id, this.#pingRole);
    if (_response.code == 50001) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"No access to changing member roles. :lock:"}}`);
    }
    if (_response.code == 50013) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Can\'t manage a role that\'s higher than mine. Move me up the list! :baby:"}}`);
    }
    return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"You\'ll never miss a game! :beer: :superhero: :mega:"}}`);
  }
  
  async removeUserPingRole(interaction) {
    var _user = interaction.member.user;
    this._onLog(`I:Removing ping role from user ${_user.id} in guild ${interaction.guild_id}.`);
    if (this.#pingRole == null) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Ping role is not set up. :no_mouth:\\nUse \`/set ping_role\` first"}}`);
    }
    if (interaction.member.roles.indexOf(this.#pingRole) == -1) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"You don\'t have a ping role. :deaf_person:"}}`);
    }
    var _response = await this.#rest.removeGuildMemberRole(interaction.guild_id, _user.id, this.#pingRole);
    if (_response.code == 50001) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"No access to changing member roles. :lock:"}}`);
    }
    if (_response.code == 50013) {
      return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Can\'t manage a role that\'s higher than mine. Move me up the list! :baby:"}}`);
    }
    return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"You will no longer be pinged. :sleeping:"}}`);
  }
  
  _sendAllVariables(interaction) {
    var _adminRole = null;
    if (this.adminRole != null) {
      _adminRole = `<@&${this.adminRole}>`;
    }
    var _pingRole = null;
    if (this.#pingRole != null) {
      _pingRole = `<@&${this.#pingRole}>`;
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"embeds":[{"title":"INTERLINKED variables :floppy_disk:","description":"\`admin_role\` = ${_adminRole}\\n\`max_server_count\` = ${this.maxServerCount}\\n\`subscribed_channels\` = ${getChannelsString(this.#subscribedChannels)}\\n\`subscription_feed_min_rate\` = ${this.#subscriptionFeedMinRate}\\n\`min_player_count\` = ${this.#minPlayerCount}\\n\`ping_role\` = ${_pingRole}\\n\`ping_min_rate\` = ${this.#pingMinRate}\\n\`ping_min_player_count\` = ${this.#pingMinPlayerCount}\\n\`blacklist\` = ${getListString(this.#blacklist)}"}]}}`);
  }
  
  _sendSubscribedChannels(interaction) {
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"embeds":[{"description":"\`subscribed_channels\` = ${getChannelsString(this.#subscribedChannels)} :floppy_disk:"}]}}`);
  }
  
  _sendRole(interaction) {
    var _var = interaction.data.options[0];
    var _varName = snakeToCamelCase(_var.name);
    var _role = null;
    if (this[_varName] != null) {
      _role = `<@&${this[_varName]}>`;
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"> \`${_var.name}\` = ${_role} :floppy_disk:"}}`);
  }
  
  _sendBlacklist(interaction) {
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"\`blacklist\` = ${getListString(this.#blacklist)} :floppy_disk:"}}`)
  }
  
  _sendVariable(interaction) {
    var _var = interaction.data.options[0];
    var _varName = snakeToCamelCase(_var.name);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"> \`${_var.name}\` = ${this[_varName]} :floppy_disk:"}}`);
  }
  
  sendVariable(interaction) {
    var _var = interaction.data.options[0];
    this._onLog(`I:Sending variable '${snakeToCamelCase(_var.name)}' to channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    switch(_var.name) {
      case 'all':
        return this._sendAllVariables(interaction);
      case 'subscribed_channels':
        return this._sendSubscribedChannels(interaction);
      case 'ping_role':
        return this._sendRole(interaction);
      case 'admin_role':
        return this._sendRole(interaction); 
      case 'blacklist':
        return this._sendBlacklist(interaction);
    }
    return this._sendVariable(interaction);
  }
  
  sendPermissionDenied(interaction) {
    this._onLog(`I:Command '${interaction.data.name}' denied for user ${interaction.member.user.id} in guild ${interaction.guild_id}.`);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Permission denied. :lock:"}}`);
  }

  resetAllVariables() {
    this.adminRole = null;
    this.#subscribedChannels = [];
    this.#subscriptionFeedMinRate = defaultSubscriptionFeedMinRate;
    this.#minPlayerCount = defaultMinPlayerCount;
    this.#pingRole = null;
    this.#pingMinRate = defaultPingMinRate;
    this.#pingMinPlayerCount = defaultPingMinPlayerCount;
    this.#blacklist = [];
    this.#canPostSubscriptionFeed = true;
    this.#canPing = true;
  }
  
  resetVariable(interaction) {
    if (!this.isAdmin(interaction.member)) return this.sendPermissionDenied(interaction);
    var _var = interaction.data.options[0];
    var _varName = snakeToCamelCase(_var.name);
    this._onLog(`I:Resetting variable ${_varName} for guild ${interaction.guild_id}.`);
    if (_varName == 'all') {                  
    }
    switch (_varName) {
      case 'all':
        this.resetAllVariables();
        return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"All INTERLINKED variables reset. :yin_yang:"}}');
      case 'adminRole':
        this.adminRole = null;
        break;
      case 'subscribedChannels':
        this.#subscribedChannels = [];
        break;
      case 'subscriptionFeedMinRate':
        this.#subscriptionFeedMinRate = defaultSubscriptionFeedMinRate;
        break;
      case 'minPlayerCount':
        this.#minPlayerCount = defaultMinPlayerCount;
        break;
      case 'pingRole':
        this.#pingRole = null;
        break;
      case 'pingMinRate':
        this.#pingMinRate = defaultPingMinRate;
        break;
      case 'pingMinPlayerCount':
        this.#pingMinPlayerCount = defaultPingMinPlayerCount;
        break;
      case 'blacklist':
        this.#blacklist = [];
        break;
      case 'canPostSubscriptionFeed':
        this.#canPostSubscriptionFeed = true;
        break;
      case 'canPing':
        this.#canPing = true;
        break;      
      default:
        this._onLog(`W:Request to reset unknown variable:${_varName}`);
        return;
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = ${JSON.stringify(this[_varName])} :bomb:"}}`);
  }
  
  setVariable(interaction) {
    if (!this.isAdmin(interaction.member)) return this.sendPermissionDenied(interaction);
    var _var = interaction.data.options[0];
    var _val = _var.options[0].value;
    var _varName = snakeToCamelCase(_var.name);
    this._onLog(`I:Setting variable '${_varName} = ${_val}' for guild ${interaction.guild_id}.`);
    this[_varName] = _val;
    if (_var.options[0].type == 8) {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = <@&${this[_varName]}> :screwdriver:"}}`);
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = ${this[_varName]} :screwdriver:"}}`);
  }
  
  subscribeChannel(interaction) {
    if (!this.isAdmin(interaction.member)) return this.sendPermissionDenied(interaction);
    this._onLog(`I:Subscribing channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    if (this.#subscribedChannels.includes(interaction.channel_id)) {
      return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is already subscribed. :sunglasses:"}}');
    }
    this.#subscribedChannels = [ interaction.channel_id ];
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is now subscribed. :beers:"}}');
  }
  
  unsubscribeChannel(interaction) {
    if (!this.isAdmin(interaction.member)) return this.sendPermissionDenied(interaction);
    this._onLog(`I:Unsubscribing channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    var _index = this.#subscribedChannels.indexOf(interaction.channel_id);
    if (_index == -1) {
      return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is not subscribed. :pensive:"}}');
    }
    this.#subscribedChannels.splice(_index, 1);
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is no longer subscribed. :sob:"}}');
  }
  
  blacklistServer(interaction) {
    if (!this.isAdmin(interaction.member)) return this.sendPermissionDenied(interaction);
    var _val = interaction.data.options[0].value;
    this._onLog(`I:Blacklisting server '${_val}' for guild ${interaction.guild_id}.`);
    if (this.#blacklist.length == maxBlacklistLength) {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"Cannot blacklist server, your blacklist length is at maximum :new_moon:"}}`);
    }
    if (this.#blacklist.includes(_val)) {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is already blacklisted :new_moon_with_face:"}}`);    
    }
    this.#blacklist.push(_val);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is now blacklisted :flag_black:"}}`);
  }
  
  unblacklistServer(interaction) {
    if (!this.isAdmin(interaction.member)) return this.sendPermissionDenied(interaction);
    var _val = interaction.data.options[0].value;
    this._onLog(`I:Unblacklisting server '${_val}' for guild ${interaction.guild_id}.`);
    var _index = this.#blacklist.indexOf(_val);
    if (_index == -1) {
      this.#blacklist.push(_val);
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is not blacklisted :sun_with_face:"}}`);
    }
    this.#blacklist.splice(_index, 1);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is no longer blacklisted :flag_white:"}}`);    
  }

  async updateServerList(serverList, image = '') {
    serverList = this._getBlacklistedServerList(serverList);
    if (this.#serverListMessageID != null) {
      var _message = this.buildServerListMessage(serverList, image, true, serverListComponents);
      this.#rest.editMessage(this.#serverListChannelID, this.#serverListMessageID, _message);
    }
  }

  async listServers(interaction, serverList, image = '') {
    serverList = this._getBlacklistedServerList(serverList);
    var _isAdmin = this.isAdmin(interaction.member);
    if (!_isAdmin) return this.sendPermissionDenied(interaction);
    var _message = this.buildServerListMessage(serverList, image, true, serverListComponents);
    var response = await this.#rest.createMessage(interaction.channel_id, _message);
    if (response.id == null) return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Couldn't send the server list. Are you sure you gave proper message permissions to me? :thinking:"}}`);
    if (response.channel_id == null) return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Couldn't send the server list, are you sure you gave proper message permissions to me? :thinking:"}}`);
    this.#serverListMessageID = response.id;
    this.#serverListChannelID = response.channel_id;
    await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Server updates will be listed here. :radio:\\nConsider using \`/subscribe\` in some other channel for feed-style updates and optional role-based ping notifications."}}`);
    return response;
  }

  async listGames(interaction, gameList) {
    var _isAdmin = this.isAdmin(interaction.member);
    if (!_isAdmin) return this.sendPermissionDenied(interaction);
    this.#gameListMessageIDs = [];
    var messages = gameList.generateDiscordMessages();
    var hash = createHash('sha256').update(JSON.stringify(gameList).toString(), 'utf-8').digest('base64');
    this.#gameListHash = hash;
    var result;
    for (let i = 0; i != messages.length; i++) {
      var message = JSON.stringify(messages[i]);
      var response = await this.#rest.createMessage(interaction.channel_id, message);
      if (response.id == null) return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Couldn't send the game list. Are you sure you gave proper message permissions to me? :thinking:"}}`);
      if (response.channel_id == null) return await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Couldn't send the game list, are you sure you gave proper message permissions to me? :thinking:"}}`);
      if (result == null) result = await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Live games list will be posted here. 🎮\\nNote that if there are any changes then the games list messages will be deleted and sent again with the latest info."}}`);
      this.#gameListChannelID = response.channel_id;
      this.#gameListMessageIDs.push(response.id);
    }
    return result;
  }

  async updateGameList(gameList) {
    if (this.#gameListChannelID == null) return;
    if (this.#gameListMessageIDs == null) return;
    if (this.#gameListMessageIDs.length == 0) return;
    var hash = createHash('sha256').update(JSON.stringify(gameList).toString(), 'utf-8').digest('base64');
    if (hash == this.#gameListHash) return;
    this.#gameListHash = hash;
    var oldMsg = await this.#rest.getChannelMessage(this.#gameListChannelID, this.#gameListMessageIDs[0]);
    if (typeof oldMsg != 'object') return;
    if (oldMsg.id == null) {
      this.#gameListChannelID = null;
      this.#gameListMessageIDs = [];
      this.#gameListHash = null;
    }
    for (let i = 0; i != this.#gameListMessageIDs.length; i++) {
      var messageID = this.#gameListMessageIDs[i];
      await this.#rest.deleteMessage(this.#gameListChannelID, messageID);
    }
    this.#gameListMessageIDs = [];
    var messages = gameList.generateDiscordMessages();
    for (let i = 0; i != messages.length; i++) {
      var message = JSON.stringify(messages[i]);
      var response = await this.#rest.createMessage(this.#gameListChannelID, message);
      this.#gameListChannelID = response.channel_id;
      this.#gameListMessageIDs.push(response.id);
    }
  }

  buildPlayersMessageContent(server) {
    if (server.playerCount == 0) return ':red_circle: No players.';
    var result = `:hugging: Online players: ${server.playerCount}\n`;
    for (let i = 0; i != server.players.length; i++) {
      var player = server.players[i];
      result += '\n' + player.name;
    }
    return result;
  }

  buildPlayersInteractionResponseData(serverList, address = null) {
    var servers = Object.values(serverList.servers);
    var server;
    if (address != null) server = serverList.servers[address];
    if (server == null) {
      if (serverList.activeServers.length == 0) {
        server = servers[0];
      } else {
        server = serverList.activeServers[0];
      }
    }
    var description;
    if (server == null) description = '';
    else description = this.buildPlayersMessageContent(server);
    var options = [];
    for (let i = 0; (i != servers.length) && (i != 15); i++) {
      var server1 = servers[i];
      if (server1 == null) break;
      options.push({ label: server1.name, value: server1.address });
    }
    var refreshBtn = {
      type: 2,
      custom_id: `list_players refresh${server == null ? '' : ' ' + server.address}`,
      label: 'Refresh',
      style: 2,
      emoji: {
        id: null,
        name: '🔁',
      },
    };
    var response = {
      flags: 1 << 6,
      embeds: [{
        title: server == null ? 'No online servers. :cloud_tornado:' : `Playing on ${server.name} (\`${server.address}\`) :busts_in_silhouette:`,
        description: description,
        timestamp: new Date().toISOString(),
        thumbnail: { url: this.logoURL },
        footer: {
          icon_url: 'https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg',
          text: 'Made by Gleammer (nice)',
        },
      }],
      components: server == null ? [
        {
          type: 1,
          components: [
            refreshBtn,
          ],
        },
      ] : [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'list_players',
              placeholder: server.name,
              options: options,
            },
          ],
        },
        {
          type: 1,
          components: [
            refreshBtn,
          ],
        },
      ],
    };
    return JSON.stringify(response);
  }

  async onListPlayersButton(interaction, serverList) {
    serverList = this._getBlacklistedServerList(serverList);
    var type;
    var customIDSplit = interaction.data.custom_id.split(' ');
    if (customIDSplit.length != 1) {
      type = 7;
      if (customIDSplit[1] == 'refresh') {
        if (customIDSplit.length == 3) {
          interaction.data.values = [ customIDSplit[2] ];
        }
      }
    }
    else if (interaction.data.values == null) type = 4;
    else type = 7;
    var data = this.buildPlayersInteractionResponseData(serverList, interaction.data.values == null ? null : interaction.data.values[0]);
    var result = await this.#rest.createInteractionResponse(interaction, `{"type":${type},"data":${data}}`);
    return result;
  }
}

export class InterlinkedDiscordJSON {
  guilds;
  
  constructor(guilds = []) {
    this.guilds = guilds;
  }
  
  toJSON() {
    return { guilds: this.guilds }
  }
  
  static fromJSON(json) {
    return InterlinkedDiscordJSON(json.guilds == null ? [] : json.guilds);
  }
}

export class InterlinkedDiscord {
  logoURL;

  get gameName() { return this.#gameName; }
  set gameName(value) {
    for (var i = 0; i != this.#guilds.length; i++) {
      this.#guilds[i].gameName = value;
    }
    this.#gameName = value;
  }

  #guilds;
  #rest;
  #gameName;
  #images;
  #onSave;
  #onLog;
  
  constructor(guilds, rest, gameName, images = new InterlinkedImages(), onSave = null, onLog = null, logoURL = defaultLogoURL) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    this.#guilds = guilds;
    this.#rest = rest;
    this.#gameName = gameName;
    this.#images = images;
    this.#onSave = onSave;
    this.#onLog = onLog;
    this.logoURL = logoURL;
  }
  
  static fromJSON(json, rest, gameName, images = new InterlinkedImages(), onSave = null, onLog = null, logoURL = defaultLogoURL) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    var _guilds = {};
    for (const [key, value] of Object.entries(json.guilds == null ? [] : json.guilds)) {
      _guilds[value.guildID] = InterlinkedGuild.fromJSON(value, rest, gameName, images, onLog, logoURL);
    }
    return new InterlinkedDiscord(_guilds, rest, gameName, images, onSave, onLog, logoURL);
  }
  
  toJSON() {
    var _guilds = [];
    for (const value of Object.values(this.#guilds)) {
      if (value.guildID == null) continue;
      _guilds.push(value.toJSON());
    }
    return { guilds: _guilds };
  }
  
  _onLog(value) {
    if (this.#onLog != null) this.#onLog(value);
  }
  
  save() {
    if (this.#onSave != null) this.#onSave(this.toJSON());
  }
  
  get guildIDs() {
    return Object.keys(this.#guilds);
  }
  
  getOrSetGuild(guildID) {
    if (!(guildID in this.#guilds)) {
      var _guild = new InterlinkedGuild(guildID, this.#rest, this.#gameName, this.#images, this.#onLog, defaultMaxServerCount, null, [], defaultSubscriptionFeedMinRate, defaultMinPlayerCount, null, defaultPingMinRate, defaultPingMinPlayerCount, [], null, null, null, null, null, this.logoURL);
    	this.#guilds[guildID] = _guild;
    	this.save();
    }
    return this.#guilds[guildID];
  }
  
  getGuild(guildID) {
    return this.#guilds[guildID];
  }
  
  setGuild(guild) {
    this.#guilds[guild.guildID] = guild;
    this.save();
  }
  
  deleteGuild(guildID) {
    delete this.#guilds[guildID];
  }
  
  postServerListInteractionResponse(interaction, serverList) {
    return this.getOrSetGuild(interaction.guild_id).postServerListInteractionResponse(interaction, serverList);
  }
  
  postServerListMessage(guildID, channelID, serverList) {
    return this.getOrSetGuild(guildID).postServerListMessage(channelID, serverList);
  }
  
  postSubscriptionFeed(guildID, serverList) {
    return this.getOrSetGuild(guildID).postSubscriptionFeed(serverList);
  }
  
  async postSubscriptionFeeds(serverList) {
    for (const guild of Object.values(this.#guilds)) {
      await guild.postSubscriptionFeed(serverList);
    }
  }
  
  listHelp(interaction) {
    return this.getOrSetGuild(interaction.guild_id).listHelp(interaction);
  }
  
  async addUserPingRole(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).addUserPingRole(interaction);
    this.save();
    return value;
  }
  
  async removeUserPingRole(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).removeUserPingRole(interaction);
    this.save();
    return value;
  }
  
  sendVariable(interaction) {
    return this.getOrSetGuild(interaction.guild_id).sendVariable(interaction);
  }
  
  async resetVariable(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).resetVariable(interaction);
    this.save();
    return value;
  }
  
  async setVariable(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).setVariable(interaction);
    this.save();
    return value;
  }
  
  async subscribeChannel(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).subscribeChannel(interaction);
    this.save();
    return value;
  }
  
  async unsubscribeChannel(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).unsubscribeChannel(interaction);
    this.save();
    return value;
  }
  
  async blacklistServer(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).blacklistServer(interaction);
    this.save();
    return value; 
  }
  
  async unblacklist(interaction) {
    var value = await this.getOrSetGuild(interaction.guild_id).unblacklistServer(interaction);
    this.save();
    return value;
  }

  async listServers(interaction, serverList) {
    var value = await this.getOrSetGuild(interaction.guild_id).listServers(interaction, serverList);
    this.save();
    return value;
  }

  async listGames(interaction, gameList) {
    var value = await this.getOrSetGuild(interaction.guild_id).listGames(interaction, gameList);
    this.save();
    return value;
  }

  async updateServerLists(serverList) {
    for (const guild of Object.values(this.#guilds)) {
      await guild.updateServerList(serverList);
    }
  }

  async updateGameLists(gameList) {
    for (const guild of Object.values(this.#guilds)) {
      await guild.updateGameList(gameList);
    }
    this.save();
  }

  async onListPlayersButton(interaction, serverList) {
    var value = await this.getOrSetGuild(interaction.guild_id).onListPlayersButton(interaction, serverList);
    this.save();
    return value;
  }
}

export class Interlinked {
  logoURL;
  gameListURL;

  get gameName() { return this.#gameName; }
  set gameName(value) {
    this.#discord.gameName = value;
    this.#gameName = value;
  }

  #steamAppID;
  #steamGameDir;
  #steamGameTypes;
  #gameName;
  #onLog;
  #isRunning;
  #botToken;
  #steamAPIKey;
  #rest;
  #gateway;
  #discord;
  #serverRequestURL;
  #servers;
  #outputEmbedJSONPath;
  #embedGeneratorGuild;
  #topServersHTMLStyle;
  #outputTopServersHTMLPath;
  #serverListHTMLStyle;
  #outputServerListHTMLPath;

  constructor(
    config,
    discordPrefs,
    onSave = null,
    onLog = null
  ) {
    if (typeof config == 'string') config = JSON.parse(config);    
    if (typeof discordPrefs == 'string') discordPrefs = JSON.parse(discordPrefs);
    this.#steamAppID = config.steamAppID;
    this.#steamGameDir = config.steamGameDir;
    if (typeof config.steamGameTypes == 'object') {
      this.#steamGameTypes = config.steamGameTypes;
    } else {
      this.#steamGameTypes = null;
    }
    this.#gameName = config.gameName;
    this.#onLog = onLog;
    this.#isRunning = false;
    this.#botToken = config.discordBotToken;
    this.#rest = REST.fromBotToken(config.discordBotToken);
    this.#gateway = null;
    if (typeof config.logoURL == 'string') {
      if (config.logoURL == 'default') this.logoURL = defaultLogoURL;
      else this.logoURL = config.logoURL;
    } else {
      this.logoURL = defaultLogoURL;
    }
    if (typeof config.gameListURL == 'string') {
      if (config.gameListURL == 'default') this.gameListURL = defaultGameListURL;
      else this.gameListURL = config.gameListURL;
    } else {
      this.gameListURL = defaultGameListURL;
    }
    var images = new InterlinkedImages(config.activeImageURLs, config.fridayImageURLs, config.mapImageURLs);
    this.#discord = InterlinkedDiscord.fromJSON(discordPrefs, this.#rest, config.gameName, images, onSave, onLog, this.logoURL);
    this.#serverRequestURL = Interlinked.getServerRequestURL(config.steamAPIKey, config.steamAppID, config.steamGameDir, this.#steamGameTypes);
    this.#servers = new InterlinkedServerList({}, [], 0, 0);
    if (config.outputEmbedJSONPath != '') this.#outputEmbedJSONPath = config.outputEmbedJSONPath;
    if (this.#outputEmbedJSONPath != null) this.#embedGeneratorGuild = new InterlinkedGuild(null, this.#rest, this.#gameName, images, this.#onLog);
    var topServersHTMLStylePath;
    if (config.topServersHTMLStylePath != '') topServersHTMLStylePath = config.topServersHTMLStylePath;
    if (topServersHTMLStylePath == null) topServersHTMLStylePath = '.topserverstyle.css';
    this.#topServersHTMLStyle = fs.readFileSync(topServersHTMLStylePath);
    if (config.outputTopServersHTMLPath != '') this.#outputTopServersHTMLPath = config.outputTopServersHTMLPath;
    var serverListHTMLStylePath;
    if (config.serverListHTMLStylePath != '') serverListHTMLStylePath = config.serverListHTMLStylePath;
    if (serverListHTMLStylePath == null) serverListHTMLStylePath = '.topserverstyle.css';
    this.#serverListHTMLStyle = fs.readFileSync(serverListHTMLStylePath);
    if (config.outputServerListHTMLPath != '') this.#outputServerListHTMLPath = config.outputServerListHTMLPath;
  }
  
  _onLog(value) {
    if (this.#onLog != null) this.#onLog(value);
  }
  
  async _onOpen(onLog) {
    this._onLog('I:Discord gateway opened.');
  }
  
  async _onReady(data) {
    this._onLog('I:Setting application commands.');
    await this.#rest.bulkOverwriteGlobalApplicationCommands(data.application.id, commands);
    var _guilds = data.guilds;
    var _localGuildIDs = this.#discord.guildIDs;
    var _remoteGuildIDs = [];
    for (var i = 0; i != _guilds.length; i++) {
      var _guild = _guilds[i];
      _remoteGuildIDs.push(_guild.id);
    }
    for (var i = 0; i != _localGuildIDs.length; i++) {
      var _guildID = _localGuildIDs[i];
      if (_remoteGuildIDs.indexOf(_guildID) == -1) this.#discord.deleteGuild(_guildID);
    }
    await this.#discord.save();
  }
  
  _onMessage(event) {
      var _data = JSON.parse(event.data);
      if (_data.op == null) return;
      switch (_data.op) {
        case 0:
          var _msg = `I:Received Opcode ${_data.op} from Discord:` + _data.t;
          if (_data.t == 'INTERACTION_CREATE') {
            var _interaction = _data.d.data;
            this._onLog(`${_msg}:${_interaction.name}.`);
            this.executeInteraction(_data.d);
            return;
          }
          if (_data.t == 'READY') {
            this._onReady(_data.d);
            return;
          }
          this._onLog(`${_msg}.`);
          return;
        case 7:
          this._onLog('I:Received Opcode 7 Reconnect from Discord.');
          return;
        case 9:
          this._onLog('I:Received Opcode 9 Invalid Session from Discord.')
          return;
        case 10:
          this._onLog('I:Received Opcode 10 Hello from Discord.');
          return;
        case 11:
          //this._onLog('I:Received Opcode 11 Heartbeat ACK from Discord.');
          return;        
        default:
          this._onLog(`W:Received unknown data from Discord:\n${JSON.stringify(_data)}`);
          return;
      }
    }
  
  _onClose(event) {
    var _msg = 'I:Discord gateway connection closed.';
    if (event.reason == '') {
      this._onLog(_msg);
      return;
    }
    this._onLog(`${_msg} Reason:${event.reason}.`);
  }
  
  _onError(event) {
    this._onLog(`E:Discord gateway connection closed abnormally:${event.error}.`);
  }
  
  _onHeartbeat(interval) {
    //this._onLog(`I:Sending Opcode 1 Heartbeat to Discord after ${interval}ms.`);
  }
  
  static getServerRequestURL(steamAPIKey, steamAppID, steamGameDir, steamGameTypes) {
    var _filter = '';
    if (steamAppID != null) {
      if (steamAppID != '') {
        _filter += `appid\\${steamAppID}`;
      }
    }
    if (steamGameDir != null) {
      if (steamGameDir != '') {
        if (_filter != '') _filter += '\\';
        _filter += `gamedir\\${steamGameDir}`;
      }
    }
    if (steamGameTypes != null) {
      if (steamGameTypes.all != null) {
        for (let i = 0; i != steamGameTypes.all.length; i++) {
          var gameType = steamGameTypes.all[i];
          if (gameType == null) continue;
          if (_filter != '') _filter += '\\';
          _filter += `gametype\\${gameType}`;
        }
      }
    }
    if (_filter == '') throw new Error('Need valid `steamAppID` or `steamGameDir` to get a server request url');
    return `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${steamAPIKey}&filter=${_filter}`;
  }
  
  _updateServerRequestURL() {
    this.#serverRequestURL = Interlinked.getServerRequestURL(this.#steamAPIKey, this.#steamAppID, this.#steamGameDir, this.#steamGameTypes);
  }
  
  isRunning() {
    return this.#isRunning;
  }
  
  set steamAPIKey(value) {
    this.#steamAPIKey = value;
    this._updateServerRequestURL();
  }
  
  set steamAppID(value) {
    this.#steamAppID = value;
    this._updateServerRequestURL();
  }
  
  set steamGameDir(value) {
    this.#steamGameDir = value;
    this._updateServerRequestURL();
  }
  
  async getServers() {
    this._onLog('I:Querying server data from Steam.');
    var _servers = await this.#rest.get(this.#serverRequestURL);
    if (typeof _servers == 'string') {
      this._onLog(`W:Received unknown data from Steam:\n${_servers}`);
      return [];
    }
    if (_servers.response == null) {
      this._onLog(`W:Received unknown data from Steam:\n${_servers}`);
      return [];
    }
    if (_servers.response.servers == null) {
      this._onLog(`W:Received unknown data from Steam:\n${_servers}`);
      return [];
    }
    var _serverDataRequests = [];
    _servers.response.servers.forEach((server) => {
      _serverDataRequests.push({
        request: queryServer(server.addr),
        server: server,
      });
    });
    var _noPasswordServers = [];
    for (let i = 0; i != _serverDataRequests.length; i++) {
      var _request = _serverDataRequests[i];
      var _server = await _request.request;
      if (_server == null) continue;
      if (_server.visibility == 1) continue;
      var _serverNameLower = _server.name.toLowerCase();
      if (_serverNameLower.includes('[test]')) continue;
      if (_serverNameLower.includes('[nodiscovery]')) continue;
      if (_request.server.name == null) _request.server.name = _server.name;
      else if (_request.server.name == 'Develop Server') _request.server.name = _server.name;
      _request.server.playerInfo = _server.playerInfo;
      _noPasswordServers.push(_request.server)
    }
    return _noPasswordServers;
  }
  
  updatePresence() {    
    if (!this.#gateway.trySend(`{"op":3,"d":{"since":null,"activities":[{"name": "${this.#servers.playerCount} online players","type": 0}],"status":"online","afk":false}}`)) {
      this._onLog('E:Discord gateway is closed.');
    }
  }
  
  async updateSteamServers() {
    this.#servers = InterlinkedServerList.fromSteamServers(await this.getServers());
    this._onLog('I:Sending subsciption feeds.');
    if (this.#botToken != '') {
      await this.#discord.postSubscriptionFeeds(this.#servers);
      await this.#discord.updateServerLists(this.#servers);
      this.updatePresence();
    }
    
    if (this.#outputEmbedJSONPath != null) {
      var serverListMsg = this.#embedGeneratorGuild.buildServerListMessage(this.#servers);
      fs.writeFileSync(this.#outputEmbedJSONPath, serverListMsg);
    }
    if (this.#outputTopServersHTMLPath != null) {
      var topServersHTML = webtoys.generateTopServersHTML(this.#gameName, this.#servers, this.#topServersHTMLStyle, this.logoURL);
      fs.writeFileSync(this.#outputTopServersHTMLPath, topServersHTML);
    }
    if (this.#outputServerListHTMLPath != null) {
      var serverListHTML = webtoys.generateServerListHTML(this.#gameName, this.#servers, this.#serverListHTMLStyle, this.logoURL);
      fs.writeFileSync(this.#outputServerListHTMLPath, serverListHTML);
    }
  }

  async listGames(interaction) {
    return this.#discord.listGames(interaction, await InterlinkedGameList.fromURL(this.gameListURL));
  }

  async updateGameLists() {
    return this.#discord.updateGameLists(await InterlinkedGameList.fromURL(this.gameListURL));
  }
  
  executeInteraction(interaction) {
    //this._onLog(interaction);
    if (typeof interaction.data.custom_id == 'string') {
      var customIDSplit = interaction.data.custom_id.split(' ');
      switch (customIDSplit[0]) {
        case 'list_players':
          return this.#discord.onListPlayersButton(interaction, this.#servers);
        case 'list_players refresh':
          return this.#discord.onListPlayersButton(interaction, this.#servers);
        case 'undefined':
          return;
      }
    }
    switch (interaction.data.name) {
      case 'help':
        return this.#discord.listHelp(interaction);
      case 'pub':
        return this.#discord.addUserPingRole(interaction);
      case 'unpub':
        return this.#discord.removeUserPingRole(interaction);
      case 'update':
        return this.#discord.postServerListInteractionResponse(interaction, this.#servers);
      case 'get':
        return this.#discord.sendVariable(interaction);
      case 'reset':
        return this.#discord.resetVariable(interaction);
      case 'set':        
        return this.#discord.setVariable(interaction);
      case 'subscribe':
        return this.#discord.subscribeChannel(interaction);
      case 'unsubscribe':
        return this.#discord.unsubscribeChannel(interaction);
      case 'blacklist':
        return this.#discord.blacklistServer(interaction);       
      case 'unblacklist':
        return this.#discord.unblacklistServer(interaction);
      case 'server_list':
        return this.#discord.listServers(interaction, this.#servers);
      case 'game_list':
        return this.listGames(interaction);
      case undefined:
        return;
      default:
        this._onLog(`W:Unknown command:${interaction.data.name}`);
        return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"flags":${1 << 6},"content":"Whoops! There appears to be a problem on our side. :exploding_head:"}}`);
    }   
  }
  
  _heartbeat() {
    if (!this.#isRunning) return;
    this.updateSteamServers();
    this.updateGameLists();
    setTimeout(() => this._heartbeat(), steamPingRate);
  }

  async start() {
    this._onLog('I:Starting.');
    this.#isRunning = true;      
    if (this.#botToken != '') {
      if (this.#gateway == null) {
        this._onLog('I:Connecting to Discord gateway.');
        this.#gateway = new Gateway(
          (await this.#rest.getGatewayURL()).url,
          this.#botToken,
          0,
          'linux',
          'INTERLINKED',
          'INTERLINKED',
        );
        this.#gateway.onOpen = (event) => this._onOpen(event);
        this.#gateway.onMessage = (event) => this._onMessage(event);
        this.#gateway.onClose = (event) => this._onClose(event);
        this.#gateway.onError = (event) => this._onError(event);
        this.#gateway.onHeartbeat = (event) => this._onHeartbeat(event);
      }
      await this.#gateway.open();
    }
    this._heartbeat();
  }
  
  stop() {
    this._onLog('I:Stopping.');
    this.#isRunning = false;
    this._onLog('I:Closing Discord gateway.');
    this.#gateway.close();
  }
}

import { REST, Gateway } from './gleamcord.js';

const steamPingRate = 30000;
const checkIsRunningRate = 500;
const defaultMinPlayerCount = 1;
const defaultPingMinRate = 3600000; // 1 hour
const defaultPingMinPlayerCount = 2;
const defaultSubscriptionFeedMinRate = 1800000; // 30 minutes
const maxBlacklistLength = 99;
const helpDesc = 'List all available commands';
const updateDesc = 'Get a list of active game servers';
const subscribeDesc = 'Subscribe channel to receive automatic updates about active game servers';
const unsubscribeDesc = 'Unsubscribe channel from receiving automatic updates about active game servers';
const pubDesc = 'Add ping role for user';
const unpubDesc = 'Remove ping role for user';
const resetDesc = 'Reset all INTERLINKED variables for this guild';
const getDesc = 'Get an INTERLINKED variable';
const getAllDesc = 'List all INTERLINKED variables';
const setDesc = 'Set an INTERLINKED variable for this guild';
const minPlayerCountDesc = 'Minimum player count to trigger suscription feed';
const subscriptionFeedMinRateDesc = 'Minimum time between two automatic updates.';
const pingRoleDesc = 'Role that that is pinged about active game servers';
const pingMinRateDesc = 'Minimum time between two pings';
const pingMinPlayerCountDesc = 'Minimum player count to trigger ping';
const removeDesc = 'Nullify an INTERLINKED variable for this guild';
const blacklistDesc = 'Blacklist a server from the servers list';
const unblacklistDesc = 'Unblacklist a server from the servers list';
const addressDesc = 'Server address in format <ip>:<port>';
const getBlacklistDesc = 'Blacklisted servers';
const commands = ('[' +
'{' + 
  `"name":"help","type":1,"description":"${helpDesc}"` +
'},' +
'{' +
  `"name":"update","type":1,"description":"${updateDesc}"` +
'},' +
'{' +
  `"name":"subscribe","type":1,"description":"${subscribeDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false` +
'},' +
'{' +
  `"name":"unsubscribe","type":1,"description":"${unsubscribeDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false` + 
'},' + 
'{' +
  `"name":"pub","type":1,"description":"${pubDesc}","dm_permission":false` +
'},' +
'{' +
  `"name":"unpub","type":1,"description":"${unpubDesc}","dm_permission":false` +
'},' +
'{' +
  `"name":"reset","type":1,"description":"${resetDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false` +
'},' +
'{' +
  `"name":"get","type":1,"description":"${getDesc}","dm_permission":false,"options":[` +
    `{"name":"all","type":1,"dm_permission":false,"description":"${getAllDesc}"},` +
    `{"name":"subscribed_channels","type":1,"dm_permission":false,"description":"${minPlayerCountDesc}"},` +
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
    `{"name":"min_player_count","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${minPlayerCountDesc}","options":[{"name":"count","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Minimum player count (default: 1)"}]},` +
    `{"name":"subscription_feed_min_rate","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${subscriptionFeedMinRateDesc}","options":[{"name":"rate","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Subscription feed minimum rate (in milliseconds, default: 1800000)"}]},` + 
    `{"name":"ping_role","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${pingRoleDesc}","options":[{"name":"role","type":8,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Role to be pinged"}]},` +
    `{"name":"ping_min_rate","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${pingMinRateDesc}","options":[{"name":"rate","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Ping minimum rate in (in milliseconds, default: 3600000)"}]},` +
    `{"name":"ping_min_player_count","type":1,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"description":"${pingMinPlayerCountDesc}","options":[{"name":"count","type":4,"default_member_permissions":"0","default_permission":false,"dm_permission":false,"required":true,"description": "Minimum ping player count (default: 2)"}]}` +
  ']' +
'},' +
'{' +
  `"name":"remove","type":1,"description":"${removeDesc}","default_member_permissions":"0","default_permission":false,"dm_permission":false,"options":[` +
    `{"name":"ping_role","type":1,"default_member_permissions":"0","dm_permission":false,"description":"${pingRoleDesc}"}` +
  ']' +
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
'}' +
']');
const helpMsg = '{"type":4,"data":{"embeds":[{' +
'"title":"Command list",' +
'"footer":{"icon_url": "https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg","text": "Made by Gleammer (nice)"},' +
'"thumbnail":{"url": "https://media.discordapp.net/attachments/1005272489380827199/1005580343270719530/logo.png"},' +
'"author":{"name":"INTERLINKED","url":"https://github.com/GleammerRay/INTERLINKED","icon_url": "https://github.com/GleammerRay/INTERLINKED/blob/main/assets/logo.png?raw=true"},' +
'"description":"' +
`\`/help\` - ${helpDesc}\\n` +
`\`/update\` - ${updateDesc}\\n` +
`\`/subscribe\` - ${subscribeDesc}\\n` +
`\`/unsubscribe\` - ${unsubscribeDesc}\\n` +
`\`/pub\` - ${pubDesc}\\n` +
`\`/unpub\` - ${unpubDesc}\\n` +
`\`/reset\` - ${resetDesc}\\n` +
`\`/get\` - ${getDesc}\\n` +
`\`/set\` - ${setDesc}\\n` +
`\`/blacklist\` - ${blacklistDesc}\\n` +
`\`/unblacklist\` - ${unblacklistDesc}\\n` +
'"}]}}';

function snakeToCamelCase(str) {
  return str.replace(/_[a-z]/g, m => m[1].toUpperCase());
}

function isFriday(date) {
  return date.getDay() == 5;
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
  constructor(address, name, mapName, playerCount, maxPlayerCount) {
    this.address = address;
    this.name = name;
    this.mapName = mapName;
    this.playerCount = playerCount;
    this.maxPlayerCount = maxPlayerCount;
  }
  
  static fromSteamServer(server) {
    return new InterlinkedServer(server.addr, server.name, server.map, server.players, server.max_players);
  }
}

export class InterlinkedConfig {
  discordBotToken;
  steamAPIKey;
  steamAppID;
  gameName;
  activeImageURLs;
  fridayImageURLs;
  mapImageURLs;
  
  constructor(discordBotToken, steamAPIKey, steamAppID = '244630', gameName = 'NEOTOKYO°', activeImageURLs = [], fridayImageURLs = []) {
    this.discordBotToken = discordBotToken;
    this.steamAPIKey = steamAPIKey;
    this.steamAppID = steamAppID;
    this.gameName = gameName;
    this.activeImageURLs = activeImageURLs;
    this.fridayImageURLs = fridayImageURLs;
    this.mapImageURLs = mapImageURLs;
  }
  
  static fromJSON(json) {
    return InterlinkedConfig(
      json.discordBotToken,
      json.steamAPIKey,
      json.steamAppID,
      json.gameName,
      json.activeImageURLs,
      json.fridayImageURLs,
      json.mapImageURLs,
    );
  }
  
  toJSON() {
    return {
      discordBotToken: this.discordBotToken,
      steamAPIKey: this.steamAPIKey,
      steamAppID: this.steamAppID,
      gameName: this.gameName,
      activeImageURLs: this.activeImageURLs,
      fridayImageURLs: this.fridayImageURLs,
      mapImageURLs: this.mapImageURLs
    }
  }
}

export class InterlinkedServerList {
  activeServers;
  serverCount;
  playerCount;

  constructor(activeServers, serverCount, playerCount) {
    this.activeServers = activeServers;
    this.serverCount = serverCount;
    this.playerCount = playerCount;
  }
  
  static fromSteamServers(servers) {
    //servers = [{players: 2, addr: '74.91.116.227:27015', name: 'BonAHNSa.com || Fridays/Weekends 1900-2200 UTC', map: 'nt_pissalley_ctg', max_players: 32}];
    var _servers = [];
    var _playerCount = 0;
    for (var i = 0; i != servers.length; i++) {
      var _server = servers[i];
      if (_server.players == null) continue;
      if (_server.players == 0) continue;
      _playerCount += _server.players;
      if (_server.addr == null) continue;
      if (_server.name == null) continue;
      if (_server.map == null) continue;
      if (_server.max_players == null) continue;
      var _interlinkedServer = InterlinkedServer.fromSteamServer(_server);
      var _position = _servers.length;
      for (var i2 = 0; i2 != _servers.length; i2++) {
        if (_server.players >= _servers[i2].playerCount) {
          _position = i2;
          break;
        }
      }
      _servers.splice(_position, 0, _interlinkedServer);
    }
    return new InterlinkedServerList(_servers, servers.length, _playerCount)
  }
}

export class InterlinkedGuild {
  gameName;
  
  set minPlayerCount(value) {
    this.#minPlayerCount = value;
    this.#canPostSubscriptionFeed = true;
    clearTimeout(this.#subscriptionFeedTimeoutID);
  }
  get minPlayerCount() {
    return this.#minPlayerCount;
  }
  set subscriptionFeedMinRate(value) {
    this.#subscriptionFeedMinRate = value;
    this.#canPostSubscriptionFeed = true;
    clearTimeout(this.#subscriptionFeedTimeoutID);
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
  
  #guildID;
  #rest;
  #images;
  #canPostSubscriptionFeed;
  #subscribedChannels;
  #subscriptionFeedMinRate;
  #minPlayerCount;
  #canPing;
  #pingRole;
  #pingMinRate;
  #pingMinPlayerCount;
  #blacklist;
  #onLog;
  
  #subscriptionFeedTimeoutID;
  #pingTimeoutID;
  
  constructor(
    guildID,
    subscribedChannels = [],
    subscriptionFeedMinRate = defaultSubscriptionFeedMinRate,
    minPlayerCount = defaultMinPlayerCount,    
    pingRole = null,
    pingMinRate = defaultPingMinRate,
    pingMinPlayerCount = defaultPingMinPlayerCount,
    blacklist = [],
    rest,
    gameName,
    images = new InterlinkedImages(),
    onLog = null,
  ) {
    this.gameName = gameName;
    
    this.#guildID = guildID;
    this.#canPostSubscriptionFeed = true;
    this.#subscribedChannels = subscribedChannels;
    this.#subscriptionFeedMinRate = subscriptionFeedMinRate;
    this.#minPlayerCount = minPlayerCount;
    this.#canPing = true;
    this.#pingRole = pingRole;
    this.#pingMinRate = pingMinRate;
    this.#pingMinPlayerCount = pingMinPlayerCount;    
    this.#blacklist = blacklist;
    this.#rest = rest;
    this.#onLog = onLog;
    this.#images = images;
    
    this.#subscriptionFeedTimeoutID = null;
    this.#pingTimeoutID = null;
  }
  
  static fromJSON(json, rest, gameName, images = new InterlinkedImages(), onLog = null) {
    return new InterlinkedGuild(
      json.guildID,
      json.subscribedChannels == null ? [] : json.subscribedChannels,
      json.subscriptionFeedMinRate == null ? defaultSubscriptionFeedMinRate : json.subscriptionFeedMinRate,
      json.minPlayerCount == null ? defaultMinPlayerCount : json.minPlayerCount,
      json.pingRole,
      json.pingMinRate == null ? defaultPingMinRate : json.pingMinRate,
      json.pingMinPlayerCount == null ? defaultPingMinPlayerCount : json.pingMinPlayerCount,
      json.blacklist == null ? [] : json.blacklist,
      rest,
      gameName,
      images,
      onLog,
    );
  }
  
  toJSON() {
    return {
      guildID: this.#guildID,
      subscribedChannels: this.#subscribedChannels,
      subscriptionFeedMinRate: this.#subscriptionFeedMinRate,
      minPlayerCount: this.#minPlayerCount,
      pingRole: this.#pingRole,
      pingMinRate: this.#pingMinRate,
      pingMinPlayerCount: this.#pingMinPlayerCount,
      blacklist: this.#blacklist
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
    if (_image != null) return _image;
  }
  
  buildServerListMessage(serverList, image = null) {
    if (serverList.activeServers.length != 0) if (image == null) image = this.getImage(serverList[0].mapName);
    var _serverCount = serverList.serverCount;
    var _playerCount = serverList.playerCount;
    var _content = '';
    var _image = '';
    var _fields = [];
    var _descSuffix = '';
    if (serverList.activeServers.length != 0) {
      _descSuffix = '\\n\\nActive servers:';
      for (var i = 0; i != serverList.activeServers.length; i++) {
        var _server = serverList.activeServers[i];
        if (this.#blacklist.includes(_server.address)) {
          _serverCount--;
          _playerCount -= _server.playerCount;
          continue;
        }
        _fields.push(`{"name":":green_circle: ${_server.name}","value":"Players: **${_server.playerCount}/${_server.maxPlayerCount}**\\nIP: \`${_server.address}\`\\nMap: \`${_server.mapName}\`"}`);
      }
    }
    if (_playerCount != 0 && image != null) {
      _image = `,"image":{"url":"${image}"}`;
    }
    if (this.shouldPing(serverList)) {
      _content = `,"content":"<@&${this.#pingRole}> :beers:"`;
      this.delayNextPing();
    }
    var _message = `{"embeds":[{"footer":{"icon_url": "https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg","text": "Made by Gleammer (nice)"},"thumbnail":{"url": "https://github.com/GleammerRay/INTERLINKED/blob/main/assets/logo.png?raw=true"},"author":{"name":"INTERLINKED","url":"https://github.com/GleammerRay/INTERLINKED","icon_url": "https://github.com/GleammerRay/INTERLINKED/blob/main/assets/logo.png?raw=true"},"title":"${this.gameName} servers list","description":"\\n:desktop: Online servers: ${_serverCount}\\n:hugging: Online players: ${_playerCount}${_descSuffix}","color":4592387,"timestamp":"${new Date().toISOString()}","fields":[${_fields.join(',')}]${_image}}]${_content}}`;
    return _message;
  }
  
  async postServerListInteractionResponse(interaction, serverList, image = null) {
    if (serverList.activeServers.length != 0) if (image == null) image = this.getImage(serverList.activeServers[0].mapName);
    this._onLog(`INFO:Sending server list to channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    if (this.shouldPing(serverList)) {
      await this.#rest.createMessage(interaction.channel_id, `{"content":"<@&${this.#pingRole}> :beers:"}`);
      this.delayNextPing();
    }
    var _message = this.buildServerListMessage(serverList, image);
    await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":${_message}}`);
  }
  
  postServerListMessage(channelID, serverList, image = null) {
    if (serverList.activeServers.length != 0) if (image == null) image = this.getImage(serverList.activeServers[0].mapName);
    if (serverList.playerCount < this.minPlayerCount) return;
    var _message = this.buildServerListMessage(serverList, image);
    this._onLog(`INFO:Sending server list to channel ${channelID} in guild ${this.#guildID}.`);
    return this.#rest.createMessage(channelID, _message);
  }
  
  async postSubscriptionFeed(serverList, image = null) {
    if (serverList.activeServers.length != 0) if (image == null) image = this.getImage(serverList.activeServers[0].mapName);
    if (!this.#canPostSubscriptionFeed) return;
    for (var i = 0; i != this.#subscribedChannels.length; i++) {
      await this.postServerListMessage(this.#subscribedChannels[i], serverList, image);
    }
    this.delayNextSubscriptionFeedUpdate();
  }
  
  subscribeChannel(interaction) {
    this._onLog(`INFO:Subscribing channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    if (this.#subscribedChannels.includes(interaction.channel_id)) {
      return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is already subscribed. :sunglasses:"}}');
      return;
    }    
    this.#subscribedChannels.push(interaction.channel_id);
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is now subscribed. :beers:"}}');
  }
  
  unsubscribeChannel(interaction) {
    this._onLog(`INFO:Unsubscribing channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    var _index = this.#subscribedChannels.indexOf(interaction.channel_id);
    if (_index == -1) {
      return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is not subscribed. :pensive:"}}');
    }
    this.#subscribedChannels.splice(_index, 1);
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is no longer subscribed. :sob:"}}');
  }
  
  async addUserPingRole(interaction) {
    var _user = interaction.member.user;
    this._onLog(`INFO:Adding ping role to user ${_user.id} in guild ${interaction.guild_id}.`);
    if (this.#pingRole == null) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Ping role is not set up. :no_mouth:\\nUse `/set ping_role` first"}}');
      return;
    }
    if (interaction.member.roles.indexOf(this.#pingRole) != -1) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You already have the ping role. :upside_down:"}}');
      return;
    }
    var _response = await this.#rest.addGuildMemberRole(interaction.guild_id, _user.id, this.#pingRole);
    if (_response.message == 'Missing Access') {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"No access to changing member roles. :lock:"}}');
    }
    await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You\'ll never miss a game! :beer: :superhero: :mega:"}}');
  }
  
  async removeUserPingRole(interaction) {
    var _user = interaction.member.user;
    this._onLog(`INFO:Removing ping role from user ${_user.id} in guild ${interaction.guild_id}.`);
    if (this.#pingRole == null) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Ping role is not set up. :no_mouth:\\nUse `/set ping_role` first"}}');
      return;
    }
    if (interaction.member.roles.indexOf(this.#pingRole) == -1) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You don\'t have a ping role. :deaf_person:"}}');
      return;
    }
    var _response = await this.#rest.removeGuildMemberRole(interaction.guild_id, _user.id, this.#pingRole);
    if (_response.message == 'Missing Access') {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"No access to changing member roles. :lock:"}}');
      return;
    }
    await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You will no longer be pinged. :sleeping:"}}');
  }
  
  resetVariables(interaction) {
    this._onLog(`INFO:Resetting variables for guild ${interaction.guild_id}.`);
    this.#subscribedChannels = [];
    this.#subscriptionFeedMinRate = defaultSubscriptionFeedMinRate;
    this.#minPlayerCount = defaultMinPlayerCount;
    this.#pingRole = null;
    this.#pingMinRate = defaultPingMinRate;
    this.#pingMinPlayerCount = defaultPingMinPlayerCount;
    this.#blacklist = [];
    this.#canPostSubscriptionFeed = true;
    this.#canPing = true;
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"All INTERLINKED variables reset. :yin_yang:"}}');
  }
  
  _sendAllVariables(interaction) {
    var _pingRole = null;
    if (this.#pingRole != null) {
      _pingRole = `<@&${this.#pingRole}>`;
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"embeds":[{"title":"INTERLINKED variables :floppy_disk:","description":"\`subscribed_channels\` = ${getChannelsString(this.#subscribedChannels)}\\n\`subscription_feed_min_rate\` = ${this.#subscriptionFeedMinRate}\\n\`min_player_count\` = ${this.#minPlayerCount}\\n\`ping_role\` = ${_pingRole}\\n\`ping_min_rate\` = ${this.#pingMinRate}\\n\`ping_min_player_count\` = ${this.#pingMinPlayerCount}\\n\`blacklist\` = ${getListString(this.#blacklist)}"}]}}`);
  }
  
  _sendSubscribedChannels(interaction) {
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"embeds":[{"description":"\`subscribed_channels\` = ${getChannelsString(this.#subscribedChannels)} :floppy_disk:"}]}}`);
  }
  
  _sendPingRole(interaction) {
    var _pingRole = null;
    if (this.#pingRole != null) {
      _pingRole = `<@&${this.#pingRole}>`;
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`ping_role\` = ${_pingRole} :floppy_disk:"}}`);
  }
  
  _sendBlacklist(interaction) {
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`blacklist\` = ${getListString(this.#blacklist)} :floppy_disk:"}}`)
  }
  
  _sendVariable(interaction) {
    var _var = interaction.data.options[0];
    var _varName = snakeToCamelCase(_var.name);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = ${this[_varName]} :floppy_disk:"}}`);
  }
  
  sendVariable(interaction) {
    var _var = interaction.data.options[0];
    this._onLog(`INFO:Sending variable '${snakeToCamelCase(_var.name)}' to channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    if (_var.name == 'all') {
      return this._sendAllVariables(interaction);
    }
    if (_var.name == 'subscribed_channels') {
      return this._sendSubscribedChannels(interaction);
    }
    if (_var.name == 'ping_role') {
      return this._sendPingRole(interaction); 
    }
    if (_var.name == 'blacklist') {
      return this._sendBlacklist(interaction);
    }
    return this._sendVariable(interaction);
  }
  
  setVariable(interaction) {
    var _var = interaction.data.options[0];
    var _val = _var.options[0].value;
    var _varName = snakeToCamelCase(_var.name);
    this._onLog(`INFO:Setting variable '${_varName} = ${_val}' for guild ${interaction.guild_id}.`);
    this[_varName] = _val;
    if (_var.options[0].type == 8) {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = <@&${this[_varName]}> :screwdriver:"}}`);
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = ${this[_varName]} :screwdriver:"}}`);
  }
  
  removeVariable(interaction) {
    var _varName = snakeToCamelCase(interaction.data.options[0].name);
    this._onLog(`INFO:Removing variable '${_varName}' for guild ${interaction.guild_id}.`);
    this[_varName] = null;
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = null :bomb:"}}`);
  }
  
  blacklist(interaction) {
    var _val = interaction.data.options[0].value;
    this._onLog(`INFO:Blacklisting server '${_val}' for guild ${interaction.guild_id}.`);
    if (this.#blacklist.length == maxBlacklistLength) {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"Cannot blacklist server, your blacklist length is at maximum :new_moon:"}}`);
    }
    if (this.#blacklist.includes(_val)) {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is already blacklisted :new_moon_with_face:"}}`);    
    }
    this.#blacklist.push(_val);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is now blacklisted :flag_black:"}}`);
  }
  
  unblacklist(interaction) {
    var _val = interaction.data.options[0].value;
    this._onLog(`INFO:Unblacklisting server '${_val}' for guild ${interaction.guild_id}.`);
    var _index = this.#blacklist.indexOf(_val);
    if (_index == -1) {
      this.#blacklist.push(_val);
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is not blacklisted :sun_with_face:"}}`);
    }
    this.#blacklist.splice(_index, 1);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"\`${_val}\` is no longer blacklisted :flag_white:"}}`);    
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
  
  constructor(guilds, rest, gameName, images = new InterlinkedImages(), onSave = null, onLog = null) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    this.#guilds = guilds;
    this.#rest = rest;
    this.#gameName = gameName;
    this.#images = images;
    this.#onSave = onSave;
    this.#onLog = onLog;
  }
  
  static fromJSON(json, rest, gameName, images = new InterlinkedImages(), onSave = null, onLog = null) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    var _guilds = {};
    for (const [key, value] of Object.entries(json.guilds == null ? [] : json.guilds)) {
      _guilds[value.guildID] = InterlinkedGuild.fromJSON(value, rest, gameName, images, onLog);
    }
    return new InterlinkedDiscord(_guilds, rest, gameName, images, onSave, onLog);
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
    if (!(guildID in this.#guilds)) this.#guilds[guildID] = new InterlinkedGuild(guildID, this.#rest, this.#gameName, this.#images, this.#onLog);
    this.save();
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
  
  async subscribeChannel(interaction) {
    await this.getOrSetGuild(interaction.guild_id).subscribeChannel(interaction);
    this.save();
  }
  
  async unsubscribeChannel(interaction) {
    await this.getOrSetGuild(interaction.guild_id).unsubscribeChannel(interaction);
    this.save();
  }
  
  async addUserPingRole(interaction) {
    await this.getOrSetGuild(interaction.guild_id).addUserPingRole(interaction);
    this.save();
  }
  
  async removeUserPingRole(interaction) {
    await this.getOrSetGuild(interaction.guild_id).removeUserPingRole(interaction);
    this.save();
  }
  
  async resetVariables(interaction) {
    await this.getOrSetGuild(interaction.guild_id).resetVariables(interaction);
    this.save();
  }
  
  sendVariable(interaction) {
    return this.getOrSetGuild(interaction.guild_id).sendVariable(interaction);
  }
  
  async setVariable(interaction) {
    await this.getOrSetGuild(interaction.guild_id).setVariable(interaction);
    this.save();
  }
  
  async removeVariable(interaction) {
    await this.getOrSetGuild(interaction.guild_id).removeVariable(interaction);
    this.save();
  }
  
  async blacklist(interaction) {
    await this.getOrSetGuild(interaction.guild_id).blacklist(interaction);
    this.save();  
  }
  
  async unblacklist(interaction) {
    await this.getOrSetGuild(interaction.guild_id).unblacklist(interaction);
    this.save();  
  }
}

export class Interlinked {
  get gameName() { return this.#gameName; }
  set gameName(value) {
    this.#discord.gameName = value;
    this.#gameName = value;
  }

  #steamAppID;
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

  constructor(
    config,
    discordPrefs,
    onSave = null,
    onLog = null
  ) {
    if (typeof config == 'string') config = eval(`(${config})`);    
    if (typeof discordPrefs == 'string') discordPrefs = eval(`(${discordPrefs})`);

    this.#steamAppID = config.steamAppID;
    this.#gameName = config.gameName;
    this.#onLog = onLog;
    this.#isRunning = false;
    this.#botToken = config.discordBotToken;
    this.#rest = REST.fromBotToken(config.discordBotToken);
    this.#gateway = null;
    this.#discord = InterlinkedDiscord.fromJSON(discordPrefs, this.#rest, config.gameName, new InterlinkedImages(config.activeImageURLs, config.fridayImageURLs, config.mapImageURLs), onSave, onLog);
    this.#serverRequestURL = Interlinked.getServerRequestURL(config.steamAPIKey, config.steamAppID);
    this.#servers = [];
  }
  
  _onLog(value) {
    if (this.#onLog != null) this.#onLog(value);
  }
  
  async _onOpen(onLog) {
    this._onLog('INFO:Discord gateway opened.');
  }
  
  _onInteraction(interaction) {
    return this.executeInteraction(interaction);
  }
  
  async _onReady(data) {
    this._onLog('INFO:Setting application commands.');
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
  
  async _onMessage(event) {
      var _data = eval(`(${event.data})`);
      if (_data.op == null) return;
      var _msg = `INFO:Discord gateway sent Opcode ${_data.op} `;
      switch (_data.op) {
        case 0:
          _msg = _msg + _data.t;
          if (_data.t == 'INTERACTION_CREATE') {
            var _interaction = _data.d.data;
            this._onLog(`${_msg}:${_interaction.name}`);
            this._onInteraction(_data.d);
            return;
          }
          if (_data.t == 'READY') {
            this._onReady(_data.d);
            return;
          }
          this._onLog(`${_msg}:'Unknown Opcode'`);
          return;
        case 10:
          this._onLog('INFO:Received Opcode 10 Hello from Discord.');
          this._onLog('INFO:Sending Opcode 2 Identify to Discord.');
          this.#gateway.send(`{"op":2,"d":{"token":"${this.#botToken}","intents":512,"properties":{"os":"linux","browser":"INTERLINKED","device":"INTERLINKED"}}}`);
          return;
        case 11:
          this._onLog('INFO:Received Opcode 11 Heartbeat ACK from Discord.');
          return;
        default:
          this._onLog('WARNING:Received unknown data from Discord:');
          this._onLog(_data);
          return;
      }
    }
  
  async _onClose(event) {
    const _closeMsg = 'INFO:Discord gateway connection closed.';
    if (event.reason != '') {
      this._onLog(`${_closeMsg} Reason:${event.reason}`);
    }
    if (this.#isRunning) {
      await this.#gateway.open();
      return;
    }
  }
  
  async _onError(event) {
    this.#gateway.onClose = null;
    this._onLog(`ERROR:Discord gateway connection closed abnormally:${event.error}`);
    if (this.#isRunning) {
      await this.#gateway.open();
      return;
    }
  }
  
  _onHeartbeat(interval) {
    this._onLog(`INFO:Sending Opcode 1 Heartbeat to Discord after ${interval}ms`);
  }
  
  static getServerRequestURL(steamAPIKey, steamAppID) {
    return `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${steamAPIKey}&filter=appid\\${steamAppID}`;
  }
  
  _updateServerRequestURL() {
    this.#serverRequestURL = Interlinked.getServerRequestURL(this.#steamAPIKey, this.#steamAppID);
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
  
  async getServers() {
    this._onLog('INFO:Querying server data from Steam.');
    var _servers = await this.#rest.get(this.#serverRequestURL);
    return _servers;
  }
  
  updatePresence() {
    this.#gateway.send(`{"op":3,"d":{"since":null,"activities":[{"name": "${this.#servers.playerCount} online players","type": 0}],"status":"online","afk":false}}`);
  }
  
  async updateSteamServers() {
    this.#servers = InterlinkedServerList.fromSteamServers((await this.getServers()).response.servers);
    this._onLog('INFO:Sending subsciption feeds.');
    await this.#discord.postSubscriptionFeeds(this.#servers);
    this.updatePresence();
  }
  
  listHelp(interaction) {
    this._onLog(`INFO:Listing help on channel ${interaction.channel_id}.`);
    return this.#rest.createInteractionResponse(interaction, helpMsg);
  }
  
  async executeInteraction(interaction) {
    //this._onLog(interaction);
    switch (interaction.data.name) {
      case 'help':
        await this.listHelp(interaction);
        return;
      case 'pub':
        await this.#discord.addUserPingRole(interaction);
        return;
      case 'unpub':
        await this.#discord.removeUserPingRole(interaction);
        return;
      case 'update':
        await this.#discord.postServerListInteractionResponse(interaction, this.#servers);
        return;
      case 'subscribe':
        await this.#discord.subscribeChannel(interaction);
        return;
      case 'unsubscribe':
        await this.#discord.unsubscribeChannel(interaction);
        return;
      case 'reset':
        await this.#discord.resetVariables(interaction);
        return;
      case 'get':
        await this.#discord.sendVariable(interaction);
        return;
      case 'set':        
        await this.#discord.setVariable(interaction);
        return;
      case 'remove':
        await this.#discord.removeVariable(interaction);
        return;
      case 'blacklist':
        await this.#discord.blacklist(interaction);       
        return;
      case 'unblacklist':
        await this.#discord.unblacklist(interaction);
        return;
      default:
        this._onLog(`WARNING:Unknown command:${interaction.data.name}`);
        return;
    }   
  }
  
  _waitForStop() {
    if (this.isRunning) {
      setTimeout(() => this._waitForStop(), checkIsRunningRate);
      return;
    }
    this.#discord.close();
  }
  
  _heartbeat() {
    if (!this.#isRunning) return;
    this.updateSteamServers();
    setTimeout(() => this._heartbeat(), steamPingRate);
  }

  async start() {  
    this._onLog('INFO:Starting.');
    this.#isRunning = true;      
    this._onLog('INFO:Connecting to Discord gateway.');      
    if (this.#gateway == null) {
      this.#gateway = new Gateway(
        (await this.#rest.getGatewayURL()).url,
        (event) => this._onOpen(event),
        (event) => this._onMessage(event),
        (event) => this._onClose(event),
        (event) => this._onError(event),
        (event) => this._onHeartbeat(event),
      )
    }
    await this.#gateway.open();
    this._waitForStop();
    this._heartbeat();
  }
  
  stop() {
    this._onLog('INFO:Stopping.');
    this.#isRunning = false;
    this._onLog('INFO:Closing Discord gateway.');
    this.#discord.close();
  }
}

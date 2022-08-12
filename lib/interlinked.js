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
const commands = ('[' +
'{' + 
  `"name":"help","type":1,"description":"${helpDesc}"` +
'},' +
'{' +
  `"name":"update","type":1,"description":"${updateDesc}"` +
'},' +
'{' +
  `"name":"subscribe","type":1,"description":"${subscribeDesc}","default_member_permissions":"0","dm_permission":false` +
'},' +
'{' +
  `"name":"unsubscribe","type":1,"description":"${unsubscribeDesc}","default_member_permissions":"0","dm_permission":false` + 
'},' + 
'{' +
  `"name":"pub","type":1,"description":"${pubDesc}","dm_permission":false` +
'},' +
'{' +
  `"name":"unpub","type":1,"description":"${unpubDesc}","dm_permission":false` +
'},' +
'{' +
  `"name":"reset","type":1,"description":"${resetDesc}","default_member_permissions":"0","dm_permission":false` +
'},' +
'{' +
  `"name":"get","type":1,"description":"${getDesc}","dm_permission":false,"options":[` +
    `{"name":"all","type":1,"description":"${getAllDesc}"},` +
    `{"name":"subscribed_channels","type":1,"description":"${minPlayerCountDesc}"},` +
    `{"name":"min_player_count","type":1,"description":"${minPlayerCountDesc}"},` +
    `{"name":"subscription_feed_min_rate","type":1,"description":"${subscriptionFeedMinRateDesc}"},` + 
    `{"name":"ping_role","type":1,"description":"${pingRoleDesc}"},` +
    `{"name":"ping_min_rate","type":1,"description":"${pingMinRateDesc}"},` +
    `{"name":"ping_min_player_count","type":1,"description":"${pingMinPlayerCountDesc}"}` +
  ']' +
'},' +
'{' +
  `"name":"set","type":1,"description":"${setDesc}","default_member_permissions":"0","dm_permission":false,"options":[` +
    `{"name":"min_player_count","type":1,"description":"${minPlayerCountDesc}","options":[{"name":"count","type":4,"required":true,"description": "Minimum player count (default: 1)"}]},` +
    `{"name":"subscription_feed_min_rate","type":1,"description":"${subscriptionFeedMinRateDesc}","options":[{"name":"rate","type":4,"required":true,"description": "Subscription feed minimum rate (in milliseconds, default: 1800000)"}]},` + 
    `{"name":"ping_role","type":1,"description":"${pingRoleDesc}","options":[{"name":"role","type":8,"required":true,"description": "Role to be pinged"}]},` +
    `{"name":"ping_min_rate","type":1,"description":"${pingMinRateDesc}","options":[{"name":"rate","type":4,"required":true,"description": "Ping minimum rate in (in milliseconds, default: 3600000)"}]},` +
    `{"name":"ping_min_player_count","type":1,"description":"${pingMinPlayerCountDesc}","options":[{"name":"count","type":4,"required":true,"description": "Minimum ping player count (default: 2)"}]}` +
  ']' +
'},' +
'{' +
  `"name":"remove","type":1,"description":"${removeDesc}","default_member_permissions":"0","dm_permission":false,"options":[` +
    `{"name":"ping_role","type":1,"description":"${pingRoleDesc}"}` +
  ']' +
'},' +
'{' +
  `"name":"blacklist","type":1,"description":"${blacklistDesc}","default_member_permissions":"0","dm_permission":false,"options":[` +
    `{"name":"address","type":3,"required":true,"description":"${addressDesc}"}` +
  ']' +
'},' +
'{' +
  `"name":"unblacklist","type":1,"description":"${unblacklistDesc}","default_member_permissions":"0","dm_permission":false,"options":[` +
    `{"name":"address","type":3,"required":true,"description":"${addressDesc}"}` +
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
    var _servers = [/*new InterlinkedServer('111.111.111.111:111', 'BonAHNSa!', 'nt_pissalley_ctg', 2, 25)*/];
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
      _servers.push(InterlinkedServer.fromSteamServer(_server));
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
  
  #onLog;
  #rest;
  #guildID;
  #canPostSubscriptionFeed;
  #subscribedChannels;
  #subscriptionFeedMinRate;
  #minPlayerCount;
  #canPing;
  #pingRole;
  #pingMinRate;
  #pingMinPlayerCount;
  #blacklist;
  
  #subscriptionFeedTimeoutID;
  #pingTimeoutID;
  
  constructor(
    rest,
    gameName,
    onLog = null,
    guildID,
    subscribedChannels = [],
    subscriptionFeedMinRate = defaultSubscriptionFeedMinRate,
    minPlayerCount = defaultMinPlayerCount,    
    pingRole = null,
    pingMinRate = defaultPingMinRate,
    pingMinPlayerCount = defaultPingMinPlayerCount,
    blacklist = [],
  ) {
    this.gameName = gameName;
    
    this.#onLog = onLog;
    this.#rest = rest;
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
    
    this.#subscriptionFeedTimeoutID = null;
    this.#pingTimeoutID = null;
  }
  
  static fromJSON(json, rest, gameName, onLog = null) {
    return new InterlinkedGuild(
      rest,
      gameName,
      onLog,
      json.guildID,
      json.subscribedChannels == null ? [] : json.subscribedChannels,
      json.subscriptionFeedMinRate == null ? defaultSubscriptionFeedMinRate : json.subscriptionFeedMinRate,
      json.minPlayerCount == null ? defaultMinPlayerCount : json.minPlayerCount,
      json.pingRole,
      json.pingMinRate == null ? defaultPingMinRate : json.pingMinRate,
      json.pingMinPlayerCount == null ? defaultPingMinPlayerCount : json.pingMinPlayerCount,
      json.blacklist == null ? [] : json.blacklist
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
  
  buildServerListMessage(serverList, image) {
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
    var _message = `{"embeds":[{"footer":{"icon_url": "https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg","text": "Made by Gleammer (nice)"},"thumbnail":{"url": "https://github.com/GleammerRay/INTERLINKED/blob/main/assets/logo.png?raw=true"},"author":{"name":"INTERLINKED","url":"https://github.com/GleammerRay/INTERLINKED","icon_url": "https://github.com/GleammerRay/INTERLINKED/blob/main/assets/logo.png?raw=true"},"title":"${this.gameName} servers list","description":"\\n:desktop: Online servers: ${serverList.serverCount}\\n:hugging: Online players: ${_playerCount}${_descSuffix}","color":4592387,"timestamp":"${new Date().toISOString()}","fields":[${_fields.join(',')}]${_image}}]${_content}}`;
    return _message;
  }
  
  async postServerListInteractionResponse(interaction, serverList, image) {
    if (serverList == null) return;
    this._onLog(`INFO:Sending server list to channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    if (this.shouldPing(serverList)) {
      await this.#rest.createMessage(interaction.channel_id, `{"content":"<@&${this.#pingRole}> :beers:"}`);
      this.delayNextPing();
    }
    var _message = this.buildServerListMessage(serverList, image);
    await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":${_message}}`);
  }
  
  postServerListMessage(channelID, serverList, image) {
    if (serverList == null) return;
    if (serverList.playerCount < this.minPlayerCount) return;
    var _message = this.buildServerListMessage(serverList, image);
    this._onLog(`INFO:Sending server list to channel ${channelID} in guild ${this.#guildID}.`);
    return this.#rest.createMessage(channelID, _message);
  }
  
  async postSubscriptionFeed(serverList, image) {
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
    this.#canPostSubscriptionFeed = true;
    this.#canPing = true;
    this.#blacklist = [];
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"All INTERLINKED variables reset. :yin_yang:"}}');
  }
  
  _getSubscribedChannelsResponse() {
    var _subscribedChannels = '\`subscribed_channels\` = ['; 
    if (this.#subscribedChannels.length != 0) {
      _subscribedChannels += '\\n';
    }
    for (var i = 0; i != this.#subscribedChannels.length; i++) {
      var _channel = this.#subscribedChannels[i];
      _subscribedChannels += `> <#${_channel}>\\n`;
    }
    _subscribedChannels += ']';
    return _subscribedChannels;
  }
  
  sendVariable(interaction) {
    var _var = interaction.data.options[0];
    this._onLog(`INFO:Sending variable '${snakeToCamelCase(_var.name)}' to channel ${interaction.channel_id} in guild ${interaction.guild_id}.`);
    if (_var.name == 'all') {
      var _descPrefix = this._getSubscribedChannelsResponse();
      var _pingRole = null;
      if (this.#pingRole != null) {
        _pingRole = `<@&${this.#pingRole}>`;
      }
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"embeds":[{"title":"INTERLINKED variables :floppy_disk:","description":"${_descPrefix}\\n\`subscription_feed_min_rate\` = ${this.#subscriptionFeedMinRate}\\n\`min_player_count\` = ${this.#minPlayerCount}\\n\`ping_role\` = ${_pingRole}\\n\`ping_min_rate\` = ${this.#pingMinRate}\\n\`ping_min_player_count\` = ${this.#pingMinPlayerCount}\\n"}]}}`);
    }
    if (_var.name == 'subscribed_channels') {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"embeds":[{"description":"${this._getSubscribedChannelsResponse()} :floppy_disk:"}]}}`);
    }
    if (_var.name == 'ping_role') {
      var _pingRole = null;
      if (this.#pingRole != null) {
        _pingRole = `<@&${this.#pingRole}>`;
      }
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`ping_role\` = ${_pingRole} :floppy_disk:"}}`);
    }
    var _varName = snakeToCamelCase(_var.name);
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = ${this[_varName]} :floppy_disk:"}}`);
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
  #gameName;
  #rest;
  #onSave;
  #onLog;
  
  constructor(guilds, gameName, rest, onSave = null, onLog = null) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    this.#guilds = guilds;
    this.#gameName = gameName;
    this.#rest = rest;
    this.#onSave = onSave;
    this.#onLog = onLog;
  }
  
  static fromJSON(json, gameName, rest, onSave, onLog = null) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    var _guilds = {};
    for (const [key, value] of Object.entries(json.guilds == null ? [] : json.guilds)) {
      _guilds[value.guildID] = InterlinkedGuild.fromJSON(value, rest, gameName, onLog);
    }
    return new InterlinkedDiscord(_guilds, gameName, rest, onSave, onLog);
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
    if (!(guildID in this.#guilds)) this.#guilds[guildID] = new InterlinkedGuild(this.#rest, this.#gameName, this.#onLog, guildID);
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
  
  postServerListInteractionResponse(interaction, serverList, image) {
    return this.getOrSetGuild(interaction.guild_id).postServerListInteractionResponse(interaction, serverList, image);
  }
  
  postServerListMessage(guildID, channelID, serverList, image) {
    return this.getOrSetGuild(guildID).postServerListMessage(channelID, serverList, image);
  }
  
  postSubscriptionFeed(guildID, serverList, image) {
    return this.getOrSetGuild(guildID).postSubscriptionFeed(serverList, image);
  }
  
  async postSubscriptionFeeds(serverList, image) {
    for (const guild of Object.values(this.#guilds)) {
      await guild.postSubscriptionFeed(serverList, image);
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
  activeImageURLs;
  fridayImageURLs;
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
    steamAppID,
    gameName,
    discordBotToken,
    steamAPIKey,
    activeImageURLs,
    fridayImageURLs,
    discordPrefs,
    onSave = null,
    onLog = null
  ) {    
    if (typeof discordPrefs == 'string') discordPrefs = eval(`(${discordPrefs})`);

    this.#steamAppID = steamAppID;
    this.#gameName = gameName;
    this.#onLog = onLog;
    this.activeImageURLs = activeImageURLs;
    this.fridayImageURLs = fridayImageURLs;
    this.#isRunning = false;
    this.#botToken = discordBotToken;
    this.#rest = REST.fromBotToken(discordBotToken);
    this.#gateway = null;
    this.#discord = InterlinkedDiscord.fromJSON(discordPrefs, gameName, this.#rest, onSave, onLog);
    this.#serverRequestURL = Interlinked.getServerRequestURL(steamAPIKey, steamAppID);
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
    await this.#discord.postSubscriptionFeeds(this.#servers, this.getImage());
    this.updatePresence();
  }
  
  getImage() {
    var _date = new Date();
    var _images = null;
    if (isFriday(_date) && this.fridayImageURLs.length != 0) {
      _images = this.fridayImageURLs;
    } else if (this.activeImageURLs.length != 0) {
      _images = this.activeImageURLs;
    } else return null;
    var _index = ranInt(0, _images.length - 1);
    return _images[_index];
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
        await this.#discord.postServerListInteractionResponse(interaction, this.#servers, this.getImage());
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

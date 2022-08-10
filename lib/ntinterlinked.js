import { REST, Gateway } from './gleamcord.js';

const steamPingRate = 30000;
const checkIsRunningRate = 500;
const defaultMinPlayerCount = 1;
const defaultPingMinRate = 3600000; // 1 hour
const defaultPingMinPlayerCount = 2;
const defaultSubscriptionFeedMinRate = 1800000; // 30 minutes
const helpDesc = 'List all available commands';
const updateDesc = 'Get a list of active NEOTOKYO° servers';
const subscribeDesc = 'Subscribe channel to receive automatic updates about active NEOTOKYO° servers';
const unsubscribeDesc = 'Unsubscribe channel from receiving automatic updates about active NEOTOKYO° servers';
const pubDesc = 'Add ping role for user';
const unpubDesc = 'Remove ping role for user';
const resetDesc = 'Reset all INTERLINKED variables for this guild';
const getDesc = 'Get an INTERLINKED variable';
const getAllDesc = 'List all INTERLINKED variables';
const setDesc = 'Set an INTERLINKED variable for this guild';
const minPlayerCountDesc = 'Minimum player count to trigger suscription feed';
const subscriptionFeedMinRateDesc = 'Minimum time between two automatic updates.';
const pingRoleDesc = 'Role that that is pinged about active NEOTOKYO° servers';
const pingMinRateDesc = 'Minimum time between two pings';
const pingMinPlayerCountDesc = 'Minimum player count to trigger ping';
const removeDesc = 'Nullify an INTERLINKED variable for this guild';
const commands = ('[' +
'{' + 
  `"name":"help","type":1,"description":"${helpDesc}"` +
'},' +
'{' +
  `"name":"update","type":1,"description":"${updateDesc}"` +
'},' +
'{' +
  `"name":"subscribe","type":1,"description":"${subscribeDesc}"` +
'},' +
'{' +
  `"name":"unsubscribe","type":1,"description":"${unsubscribeDesc}"` + 
'},' + 
'{' +
  `"name":"pub","type":1,"description":"${pubDesc}"` +
'},' +
'{' +
  `"name":"unpub","type":1,"description":"${unpubDesc}"` +
'},' +
'{' +
  `"name":"reset","type":1,"description":"${resetDesc}"` +
'},' +
'{' +
  `"name":"get","type":1,"description":"${getDesc}","options":[` +
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
  `"name":"set","type":1,"description":"${setDesc}","options":[` +
    `{"name":"min_player_count","type":1,"description":"${minPlayerCountDesc}","options":[{"name":"count","type":4,"required":"true","description": "Minimum player count (default: 1)"}]},` +
    `{"name":"subscription_feed_min_rate","type":1,"description":"${subscriptionFeedMinRateDesc}","options":[{"name":"rate","type":4,"required":"true","description": "Subscription feed minimum rate (in milliseconds, default: 1800000)"}]},` + 
    `{"name":"ping_role","type":1,"description":"${pingRoleDesc}","options":[{"name":"role","type":8,"required":"true","description": "Role to be pinged"}]},` +
    `{"name":"ping_min_rate","type":1,"description":"${pingMinRateDesc}","options":[{"name":"rate","type":4,"required":"true","description": "Ping minimum rate in (in milliseconds, default: 3600000)"}]},` +
    `{"name":"ping_min_player_count","type":1,"description":"${pingMinPlayerCountDesc}","options":[{"name":"count","type":4,"required":"true","description": "Minimum ping player count (default: 2)"}]}` +
  ']' +
'},' +
'{' +
  `"name":"remove","type":1,"description":"${removeDesc}","options":[` +
    `{"name":"ping_role","type":1,"description":"${pingRoleDesc}"}` +
  ']' +
'}' +
']');
const helpMsg = '{"type":4,"data":{"embeds":[{' +
'"title":"Command list",' +
'"footer":{"icon_url": "https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg","text": "Made by Gleammer (nice)"},' +
'"thumbnail":{"url": "https://media.discordapp.net/attachments/1005272489380827199/1005580343270719530/logo.png"},' +
'"author":{"name":"INTERLINKED","url":"https://github.com/GleammerRay/NTInterlinked","icon_url": "https://media.discordapp.net/attachments/1005272489380827199/1005580343270719530/logo.png"},' +
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
'"}]}}';

function snakeToCamelCase(str) {
  return str.replace(/_[a-z]/g, m => m[1].toUpperCase());
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isFriday(date) {
  return date.getDay() == 5;
}

function ranInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export class NTServer {
  constructor(address, name, mapName, playerCount, maxPlayerCount) {
    this.address = address;
    this.name = name;
    this.mapName = mapName;
    this.playerCount = playerCount;
    this.maxPlayerCount = maxPlayerCount;
  }
  
  static fromSteamServer(server) {
    return new NTServer(server.addr, server.name, server.map, server.players, server.max_players);
  }
}

export class NTServerList {
  activeServers;
  serverCount;
  playerCount;

  constructor(activeServers, serverCount, playerCount) {
    this.activeServers = activeServers;
    this.serverCount = serverCount;
    this.playerCount = playerCount;
  }
  
  static fromSteamServers(servers) {
    var _servers = [/*new NTServer('111.111.111.111:111', 'BonAHNSa!', 'nt_pissalley_ctg', 2, 25)*/];
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
      _servers.push(NTServer.fromSteamServer(_server));
    }
    return new NTServerList(_servers, servers.length, _playerCount)
  }
}

export class NTIGuild { 
  subscribedChannels;
  
  set minPlayerCount(value) {
    this.#minPlayerCount = value;
    this.#canPostSubscriptionFeed = true;
  }
  get minPlayerCount() {
    return this.#minPlayerCount;
  }
  set subscriptionFeedMinRate(value) {
    this.#subscriptionFeedMinRate = value;
    this.#canPostSubscriptionFeed = true;
  }
  get subscriptionFeedMinRate() {
    return this.#subscriptionFeedMinRate;
  }
  set pingRole(value) {
    this.#pingRole = value;
    this.#canPing = true;
  }
  get pingRole() {
    return this.#pingRole;
  }
  set pingMinRate(value) {
    this.#pingMinRate = value;
    this.#canPing = true;
  }
  get pingMinRate() {
    return this.#pingMinRate;
  }
  set pingMinPlayerCount(value) {
    this.#pingMinPlayerCount = value;
    this.#canPing = true;
  }
  get pingMinPlayerCount() {
    return this.#pingMinPlayerCount;
  }
  
  #onLog;
  #rest;
  #guildID;
  #canPostSubscriptionFeed;
  #subscriptionFeedMinRate;
  #minPlayerCount;
  #canPing;
  #pingRole;
  #pingMinRate;
  #pingMinPlayerCount;
  
  constructor(
    rest,
    onLog,
    guildID,
    subscribedChannels = [],
    subscriptionFeedMinRate = defaultSubscriptionFeedMinRate,
    minPlayerCount = defaultMinPlayerCount,    
    pingRole = null,
    pingMinRate = defaultPingMinRate,
    pingMinPlayerCount = defaultPingMinPlayerCount,
  ) {
    this.subscribedChannels = subscribedChannels;
    
    this.#onLog = onLog;
    this.#rest = rest;
    this.#guildID = guildID;
    this.#canPostSubscriptionFeed = true;
    this.#subscriptionFeedMinRate = subscriptionFeedMinRate;
    this.#minPlayerCount = minPlayerCount;
    this.#canPing = true;
    this.#pingRole = pingRole;
    this.#pingMinRate = pingMinRate;
    this.#pingMinPlayerCount = pingMinPlayerCount;
  }
  
  static fromJSON(json, rest, onLog) {
    return new NTIGuild(
      rest,
      onLog,
      json.guildID,
      json.subscribedChannels,
      json.subscriptionFeedMinRate,
      json.minPlayerCount,
      json.pingRole,
      json.pingMinRate,
      json.pingMinPlayerCount,
    );
  }
  
  toJSON() {
    return {
      guildID: this.#guildID,
      subscribedChannels: this.subscribedChannels,
      subscriptionFeedMinRate: this.#subscriptionFeedMinRate,
      minPlayerCount: this.#minPlayerCount,
      pingRole: this.#pingRole,
      pingMinRate: this.#pingMinRate,
      pingMinPlayerCount: this.#pingMinPlayerCount,
    }
  }
  
  _onLog(value) {
    if (this.#onLog != null) this.#onLog(value);
  }
  
  getID() {
    return this.#guildID;
  }
  
  getRoles() {
    return this.#rest.getGuildRoles(this.#guildID);
  }
  
  async delayNextSubscriptionFeedUpdate() {
    if (this.#canPostSubscriptionFeed) return;    
    await delay(this.#subscriptionFeedMinRate);
    this.#canPostSubscriptionFeed = true;      
  }
  
  async delayNextPing() {
    if (this.#canPing == false) {
      await delay(this.#pingMinRate);
      this.#canPing = true;
    }
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
    var _content = '';
    var _image = '';
    var _fields = [];
    var _descSuffix = '';
    if (serverList.playerCount != 0 && image != null) {
      _image = `,"image":{"url":"${image}"}`;
    }
    if (this.shouldPing(serverList)) {
      _content = `,"content":"<@&${this.#pingRole}> :beers:"`;
          this.#canPing = false;
          this.delayNextPing();
    }
    if (serverList.activeServers.length != 0) {
      _descSuffix = '\\n\\nActive servers:';
      for (var i = 0; i != serverList.activeServers.length; i++) {
        var _server = serverList.activeServers[i];
        _fields.push(`{"name":":green_circle: ${_server.name}","value":"Players: **${_server.playerCount}/${_server.maxPlayerCount}**\\nIP: \`${_server.address}\`\\nMap: \`${_server.mapName}\`"}`);
      }
    }
    var _message = `{"embeds":[{"footer":{"icon_url": "https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg","text": "Made by Gleammer (nice)"},"thumbnail":{"url": "https://media.discordapp.net/attachments/1005272489380827199/1005580343270719530/logo.png"},"author":{"name":"INTERLINKED","url":"https://github.com/GleammerRay/NTInterlinked","icon_url": "https://media.discordapp.net/attachments/1005272489380827199/1005580343270719530/logo.png"},"title":"NEOTOKYO° servers list","description":"\\n:desktop: Online servers: ${serverList.serverCount}\\n:hugging: Online players: ${serverList.playerCount}${_descSuffix}","color":4592387,"timestamp":"${new Date().toISOString()}","fields":[${_fields.join(',')}]${_image}}]${_content}}`;
    return _message;
  }
  
  async postServerListInteractionResponse(interaction, serverList, image) {
    if (serverList == null) return;
    this._onLog(`INFO:Sending NEOTOKYO° server list to channel ${interaction.channel_id}.`);
    if (this.shouldPing(serverList)) {
      await this.#rest.createMessage(interaction.channel_id, `{"content":"<@&${this.#pingRole}> :beers:"}`);
      this.#canPing = false;
      this.delayNextPing();
    }
    var _message = this.buildServerListMessage(serverList, image);
    await this.#rest.createInteractionResponse(interaction, `{"type":4,"data":${_message}}`);
  }
  
  postServerListMessage(channelID, serverList, image) {
    if (serverList == null) return;
    if (serverList.playerCount < this.minPlayerCount) return;
    var _message = this.buildServerListMessage(serverList, image);
    this._onLog(`INFO:Sending NEOTOKYO° server list to channel ${channelID}.`);
    return this.#rest.createMessage(channelID, _message);
  }
  
  async postSubscriptionFeed(serverList, image) {
    if (!this.#canPostSubscriptionFeed) return;
    this.#canPostSubscriptionFeed = false;
    for (var i = 0; i != this.subscribedChannels.length; i++) {
      await this.postServerListMessage(this.subscribedChannels[i], serverList, image);
    }
    this.delayNextSubscriptionFeedUpdate();
  }
  
  subscribeChannel(interaction) {
    if (this.subscribedChannels.includes(interaction.channel_id)) {
      return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is already subscribed. :sunglasses:"}}');
      return;
    }    
    this.subscribedChannels.push(interaction.channel_id);
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is now subscribed. :beers:"}}');
  }
  
  unsubscribeChannel(interaction) {
    var _index = this.subscribedChannels.indexOf(interaction.channel_id);
    if (_index == -1) {
      return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is not subscribed. :pensive:"}}');
    }
    this.subscribedChannels.splice(_index, 1);
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Channel is no longer subscribed. :sob:"}}');
  }
  
  async addUserPingRole(interaction) {
    if (this.#pingRole == null) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Ping role is not set up. :no_mouth:\\nUse `/set ping_role` first"}}');
      return;
    }
    if (interaction.member.roles.indexOf(this.#pingRole) != -1) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You already have the ping role. :upside_down:"}}');
      return;
    }
    var _response = await this.#rest.addGuildMemberRole(interaction.guild_id, interaction.member.user.id, this.#pingRole);
    if (_response.message == 'Missing Access') {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"No access to changing member roles. :lock:"}}');
    }
    await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You\'ll never miss a game! :beer: :superhero: :mega:"}}');
  }
  
  async removeUserPingRole(interaction) {
    if (this.#pingRole == null) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"Ping role is not set up. :no_mouth:\\nUse `/set ping_role` first"}}');
      return;
    }
    if (interaction.member.roles.indexOf(this.#pingRole) == -1) {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You don\'t have a ping role. :deaf_person:"}}');
      return;
    }
    var _response = await this.#rest.removeGuildMemberRole(interaction.guild_id, interaction.member.user.id, this.#pingRole);
    if (_response.message == 'Missing Access') {
      await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"No access to changing member roles. :lock:"}}');
      return;
    }
    await this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"You will no longer be pinged. :sleeping:"}}');
  }
  
  resetVariables(interaction) {
    this.subscribedChannels = [];
    this.#subscriptionFeedMinRate = defaultSubscriptionFeedMinRate;
    this.#minPlayerCount = defaultMinPlayerCount;
    this.#pingRole = null;
    this.#pingMinRate = defaultPingMinRate;
    this.#pingMinPlayerCount = defaultPingMinPlayerCount;
    this.#canPostSubscriptionFeed = true
    this.#canPing = true;
    return this.#rest.createInteractionResponse(interaction, '{"type":4,"data":{"content":"All INTERLINKED variables reset. :yin_yang:"}}');
  }
  
  _getSubscribedChannelsResponse() {
    var _subscribedChannels = '\`subscribed_channels\` = ['; 
    if (this.subscribedChannels.length != 0) {
      _subscribedChannels += '\\n';
    }
    for (var i = 0; i != this.subscribedChannels.length; i++) {
      var _channel = this.subscribedChannels[i];
      _subscribedChannels += `> <#${_channel}>\\n`;
    }
    _subscribedChannels += ']';
    return _subscribedChannels;
  }
  
  sendVariable(interaction) {
    var _var = interaction.data.options[0];
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
    var _varName = snakeToCamelCase(_var.name);
    this[_varName] = _var.options[0].value;
    if (_var.options[0].type == 8) {
      return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = <@&${_var.options[0].value}> :screwdriver:"}}`);
    }
    return this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = ${this[_varName]} :screwdriver:"}}`);
  }
  
  removeVariable(interaction) {
    var _varName = snakeToCamelCase(interaction.data.options[0].name);
    this[_varName] = null;
    this.#rest.createInteractionResponse(interaction, `{"type":4,"data":{"content":"> \`${_var.name}\` = null :bomb:"}}`);
  }
}

export class NTIDiscordJSON {
  guilds;
  
  constructor(guilds = []) {
    this.guilds = guilds;
  }
  
  toJSON() {
    return { guilds: this.guilds }
  }
  
  static fromJSON(json) {
    return NTIDiscordJSON(json.guilds);
  }
}

export class NTIDiscord {
  #guilds;
  #rest;
  #onSave;
  #onLog;
  
  constructor(guilds, rest, onSave, onLog) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    this.#guilds = guilds;
    this.#rest = rest;
    this.#onSave = onSave;
    this.#onLog = onLog;
  }
  
  static fromJSON(json, rest, onSave, onLog) {
    if (typeof rest == 'string') rest = REST.fromBotToken(rest);
    var _guilds = {};   
    for (const [key, value] of Object.entries(json.guilds)) {
      _guilds[value.guildID] = NTIGuild.fromJSON(value, rest, onLog);
    }
    return new NTIDiscord(_guilds, rest, onSave, onLog);
  }
  
  toJSON() {
    var _guilds = [];
    for (const value of Object.values(this.#guilds)) {
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
    if (!(guildID in this.#guilds)) this.#guilds[guildID] = new NTIGuild(this.#rest, this.#onLog, guildID);
    this.save();
    return this.#guilds[guildID];
  }
  
  getGuild(guildID) {
    return this.#guilds[guildID];
  }
  
  setGuild(guild) {
    this.#guilds[guild.getID()] = guild;
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
    this._onLog(`INFO:Channel ${interaction.channel_id} in guild ${interaction.guild_id} is now subscribed.`);
  }
  
  async unsubscribeChannel(interaction) {
    await this.getOrSetGuild(interaction.guild_id).unsubscribeChannel(interaction);
    this.save();
    this._onLog(`INFO:Channel ${interaction.channel_id} in guild ${interaction.guild_id} is no longer subscribed.`);
  }
  
  async addUserPingRole(interaction) {
    await this.getOrSetGuild(interaction.guild_id).addUserPingRole(interaction);
    this.save();
    this._onLog(`INFO:Ping role added to user ${interaction.member.user.id} in guild ${interaction.guild_id}`);
  }
  
  async removeUserPingRole(interaction) {
    this._onLog(`INFO:Removing ping role from user ${interaction.member.user.id} in guild ${interaction.guild_id}`);
    await this.getOrSetGuild(interaction.guild_id).removeUserPingRole(interaction);
    this.save();
  }
  
  async resetVariables(interaction) {
    this._onLog(`INFO:Resetting variables for guild ${interaction.guild_id}`);
    await this.getOrSetGuild(interaction.guild_id).resetVariables(interaction);
    this.save();
  }
  
  sendVariable(interaction) {
    this._onLog(`INFO:Sending variable '${snakeToCamelCase(interaction.data.options[0].name)}' to channel ${interaction.channel_id} in guild ${interaction.guild_id}`);
    return this.getOrSetGuild(interaction.guild_id).sendVariable(interaction);
  }
  
  async setVariable(interaction) {
    this._onLog(`INFO:Setting variable '${snakeToCamelCase(interaction.data.options[0].name)} = ${interaction.data.options[0].options[0].value}' for guild ${interaction.guild_id}`);
    await this.getOrSetGuild(interaction.guild_id).setVariable(interaction);
    this.save();
  }
  
  async removeVariable(interaction) {
    this._onLog(`INFO:Removing variable '${snakeToCamelCase(interaction.data.options[0].name)}' for guild ${interaction.guild_id}`);
    await this.getOrSetGuild(interaction.guild_id).removeVariable(interaction);
    this.save();
  }
}

export class NTInterlinked {
  activeImageURLs;
  fridayImageURLs;

  #onLog;
  #isRunning;
  #botToken;
  #rest;
  #gateway;
  #discord;
  #ntRequestURL;
  #ntServers; 

  constructor(
    discordBotToken,
    steamAPIKey,
    activeImageURLs,
    fridayImageURLs,
    discordPrefs,
    onSave,
    onLog
  ) {    
    if (typeof discordPrefs == 'string') discordPrefs = eval(`(${discordPrefs})`);
  
    this.#onLog = onLog;
    this.activeImageURLs = activeImageURLs;
    this.fridayImageURLs = fridayImageURLs;
    this.#isRunning = false;
    this.#botToken = discordBotToken;
    this.#rest = REST.fromBotToken(discordBotToken);
    this.#gateway = null;
    this.#discord = NTIDiscord.fromJSON(discordPrefs, this.#rest, onSave, onLog);
    this.#ntRequestURL = this.getNTRequestURL(steamAPIKey);
    this.#ntServers = [];
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
          this.#gateway.send(`{"op":2,"d":{"token":"${this.#botToken}","intents":512,"properties":{"os":"linux","browser":"NTInterlinked","device":"NTInterlinked"}}}`);
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
  
  getNTRequestURL(steamAPIKey) {
    return `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${steamAPIKey}&filter=appid\\244630`;
  }
  
  isRunning() {
    return this.#isRunning;
  }
  
  set steamAPIKey(value) {
    this.#ntRequestURL = this.getNTRequestURL(steamAPIKey);
  }
  
  async getNeotokyoServers() {
    this._onLog('INFO:Querying NEOTOKYO° server data from Steam.');
    var _servers = await this.#rest.get(this.#ntRequestURL);
    return _servers;
  }
  
  async updateNeotokyoServers() {
    this.#ntServers = NTServerList.fromSteamServers((await this.getNeotokyoServers()).response.servers);
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
        await this.#discord.postServerListInteractionResponse(interaction, this.#ntServers, this.getImage());
        return;
      case 'subscribe':
        await this.#discord.subscribeChannel(interaction);
        await this.#discord.save();
        return;
      case 'unsubscribe':
        await this.#discord.unsubscribeChannel(interaction);
        await this.#discord.save();
        return;
      case 'reset':
        await this.#discord.resetVariables(interaction);
      case 'get':
        await this.#discord.sendVariable(interaction);
        return;
      case 'set':        
        await this.#discord.setVariable(interaction);
        return;
      case 'remove':
        await this.#discord.removeVariable(interaction);
        return;
      default:
        this._onLog(`WARNING:Unknown command:${interaction.data.name}`);
        return;
    }   
  }
  
  async _waitForStop(discord) {
    while (this.isRunning) {
      await delay(checkIsRunningRate);
    }
    this.#discord.close();
  }
  
  async _ntHeartbeat() {
    while (this.#isRunning = true) {
      await this.updateNeotokyoServers();
      this._onLog('INFO:Sending subsciption feed.');
      await this.#discord.postSubscriptionFeeds(this.#ntServers, this.getImage());
      await delay(steamPingRate);
    }
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
    this._ntHeartbeat();
  }
  
  stop() {
    this._onLog('INFO:Stopping.');
    this.#isRunning = false;
    this._onLog('INFO:Closing Discord gateway.');
    this.#discord.close();
  }
}

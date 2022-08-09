import WebSocket from 'ws';
import XMLHttpRequest from 'xmlhttprequest' ;

XMLHttpRequest.XMLHttpRequest();

const apiVersion = '10';
const restUrl = `https://discord.com/api/v${apiVersion}`;
const restChannelsURL = `${restUrl}/channels`;
const apiGuildsURL = `${restUrl}/guilds`;
const apiApplicationsURL = `${restUrl}/applications`;
const apiInteractionsURL = `${restUrl}/interactions`;
const restGatewayURL = `${restUrl}/gateway`;
const checkAPIFreeRate = 50;
const checkResponseRate = 50;
const apiRequestRate = 50;
const gatewayParams = `?v=${apiVersion}&encoding=json`;

var isLoaded = false;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class REST {
  #header;
  #isAPIBusy;
  
  constructor(header) {
    this.#header = header;
    this.#isAPIBusy = false;
  }
  
  static fromBotToken(botToken) {
    var rest = new REST();
    rest.setBotToken(botToken);
    return rest;
  }
  
  setBotToken(value) {
    this.#header = `Bot ${value}`;
  }
  
  async sendRequest(url, method, body) {
    while (this.#isAPIBusy) {
      await delay(checkAPIFreeRate);      
    }
    this.#isAPIBusy = true;
    await delay(apiRequestRate);

    var _response = '';
    while (true) {
      var _xhr = new XMLHttpRequest.XMLHttpRequest();
      _xhr.open(method, url, true);
      _xhr.setRequestHeader('Authorization', this.#header);
      _xhr.setRequestHeader('Content-Type', 'application/json');
      _xhr.responseType = 'json';
      _xhr.send(body);  
      while (true) {
        await delay(checkResponseRate);
        if (_xhr.readyState == 4) {
          break;
        }
      }
      if (_xhr.responseText == '') break;
      _response = eval(`(${_xhr.responseText})`);
      if (_response.message != 'You are being rate limited.') break;
      await delay(_response.retryAfter) * 1000;
    }
    this.#isAPIBusy = false;
    return _response;
  }

  get(url) {
    return this.sendRequest(url, 'GET');
  }
  
  post(url, body) {
    return this.sendRequest(url, 'POST', body);
  }
  
  delete(url) {
    return this.sendRequest(url, 'DELETE');
  }
  
  put(url, body) {
    return this.sendRequest(url, 'PUT', body);
  }
  
  getGatewayURL() {
    return this.get(restGatewayURL);
  }
  
  getChannelMessage(channelID, messageID) {
    return this.get(`${restChannelsURL}/${channelID}/messages/${messageId}`);
  }
  
  getGuildRoles(guildID) {
    return this.get(`${discordAPIGuildsUrl}/${guildID}/roles`);
  }
  
  createMessage(channelID, message) {
    return this.post(`${restChannelsURL}/${channelID}/messages`, message);
  }
  
  createInteractionResponse(interaction, response) {
    return this.post(`${apiInteractionsURL}/${interaction.id}/${interaction.token}/callback`, response);
  }
  
  addGuildMemberRole(guildID, userID, roleID) {
    return this.put(`${apiGuildsURL}/${guildID}/members/${userID}/roles/${roleID}`);
  }
  
  removeGuildMemberRole(guildID, userID, roleID) {
    return this.delete(`${apiGuildsURL}/${guildID}/members/${userID}/roles/${roleID}`);
  }
  
  bulkOverwriteGlobalApplicationCommands(applicationID, commands) {
    return this.put(`${apiApplicationsURL}/${applicationID}/commands`, commands);
  }
}

export class Gateway {
  gatewayURL;
  onOpen;
  onMessage;
  onClose;
  onError;
  onHeartbeat;

  #botToken;
  #socket;
  #heartbeatInterval;
  #heartbeatSeqNum; 
  
  constructor(gatewayURL, onOpen = null, onMessage = null, onClose = null, onError = null, onHeartbeat = null) {
    this.gatewayURL = gatewayURL;
    this.onOpen = onOpen;
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.onError = onError;
    this.onHeartbeat = onHeartbeat;
    
    this.#socket = null;
    this.#heartbeatInterval = null;
    this.#heartbeatSeqNum = null;
  }
  
  send(data) {
    this.#socket.send(data);
  }
  
  async _heartbeat() {
    if (this.onHeartbeat != null) this.onHeartbeat(this.#heartbeatInterval);
    this.#socket.send(`{"op":1,"d":${this.#heartbeatSeqNum}}`);
  }
  
  async _maintainHeartbeat() {
    await delay(this.#heartbeatInterval);
    while(this.#socket != null) {
      this._heartbeat();
      await delay(this.#heartbeatInterval);
    }
  }
  
  async open(onOpen, onMessage, onClose, onError) {
    if (onOpen != null) this.onOpen = onOpen;
    if (onMessage != null) this.onMessage = onMessage;
    if (onClose != null) this.onClose = onClose;
    if (onError != null) this.onError = onError;
    this.#socket = new WebSocket(`${this.gatewayURL}/${gatewayParams}`);
    this.#socket.onopen = (event) => {
      if (this.onOpen != null) this.onOpen(event);
    }
    this.#socket.onmessage = (event) => {
      var _data = eval(`(${event.data})`);
      if (this.onMessage != null) this.onMessage(event);
      if (_data.op == 1) {
        _heartBeat();
        return;
      }
      if (_data.op == 10) {
        this.#heartbeatInterval = _data.d.heartbeat_interval;
        this._maintainHeartbeat();
        return;
      }
    }
    this.#socket.onclose = (event) => {
      if (this.onClose != null) this.onClose(event)
    }
    this.#socket.onerror = (event) => {
      if (this.onError != null) this.onError(event)
    }
  }
  
  close() {
    if (this.#socket == null) return;
    this.#socket.close();
    this.#socket = null;
  }
}

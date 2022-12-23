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
      try {
        _response = JSON.parse(_xhr.responseText);
      } catch (e) {
        _response = _xhr.responseText;
      }
      if (_response.retry_after == null) break;
      await delay(_response.retry_after) * 1000;
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
  
  createGlobalApplicationCommand(applicationID, command) {
    return this.post(`${apiApplicationsURL}/${applicationID}/commands`, command);
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

  #shouldClose;
  #botToken;
  #socket;
  #identify;
  #heartbeatInterval;
  #heartbeatSeqNum;
  #heartbeatTimeout;
  #sessionID;
  #isResuming;
  #resumeGatewayURL;
  #lastSequenceNumber;  
  
  get readyState() {
    return this.#socket == null ? null : this.#socket.readyState;
  }

  constructor(gatewayURL, botToken, intents, os, browser, device) {
    this.gatewayURL = gatewayURL;

    this.#botToken = botToken;
    this.#socket = null;
    this.#identify = `{"op":2,"d":{"token":"${botToken}","intents":${intents},"properties":{"os":"${os}","browser":"${browser}","device":"${device}"}}}`;
    this.#heartbeatInterval = null;
    this.#heartbeatSeqNum = null;
    this.#heartbeatTimeout = null;
    this.#isResuming = false;
    this.#resumeGatewayURL = gatewayURL;
  }
  
  send(data) {
    this.#socket.send(data);
  }
  
  trySend(data) {
    if (this.#socket == null) return false;
    if (this.#socket.readyState != 1) return false;
    this.#socket.send(data);
    return true;
  }
  
  _heartbeat() {
    if (this.onHeartbeat != null) this.onHeartbeat(this.#heartbeatInterval);
    this.trySend(`{"op":1,"d":${this.#heartbeatSeqNum}}`);
  }
  
  async _maintainHeartbeat() {
    clearTimeout(this.#heartbeatTimeout);    
    if (this.#socket == null) return;
    this._heartbeat();
    this.#heartbeatTimeout = setTimeout(() => this._maintainHeartbeat(), this.#heartbeatInterval);
  }

  reconnect() {
    if (this.#socket == null) {
      this.open();
      return;
    }
    this.#socket.close();
  }
  
  close() {
    this.#isResuming = false;
    clearTimeout(this.#heartbeatTimeout);
    if (this.#socket == null) return;
    this.#socket.onclose = (event) => {
      if (this.onClose != null) this.onClose(event);
    };
    this.#socket.close();
    this.#socket = null;
  }
  
  open(onOpen = null, onMessage = null, onClose = null, onError = null, onHeartbeat = null) {
    if (onOpen != null) this.onOpen = onOpen;
    if (onMessage != null) this.onMessage = onMessage;
    if (onClose != null) this.onClose = onClose;
    if (onError != null) this.onError = onError;
    if (onHeartbeat != null) this.onHeartbeat = onHeartbeat;
    this.#socket = new WebSocket(`${this.gatewayURL}/${gatewayParams}`);
    this.#socket.onopen = (event) => {      
      if (this.onOpen != null) this.onOpen(event);
    };
    this.#socket.onmessage = (event) => {
      var _data = JSON.parse(event.data);
      if (this.onMessage != null) this.onMessage(event);
      switch (_data.op) {
        case 0:
          this.#lastSequenceNumber = _data.s;
          if (_data.t == 'RESUMED') {
            this.#isResuming = false;
            return;
          }
          if (_data.t == 'READY') {
            this.#isResuming = false;
            this.#sessionID = _data.d.session_id;
            this.#resumeGatewayURL = _data.d.resume_gateway_url;
            return;
          }
          return;
        case 1:
          // Heartbeat
          this._heartBeat();          
          return;
        case 7:
          // Reconnect          
          this.#socket.close();
          return;
        case 9:
          // Invalid Session
          if (this.#isResuming) {
            setTimeout(() => {
                this.trySend(this.#identify); 
              },
              3000,
            );
          }
          return;
        case 10:
          // Hello
          if (this.#isResuming) {
            this.#socket.send(`{"op":6,"d":{"token":"${this.#botToken}","session_id":"${this.#sessionID}","seq":${this.#lastSequenceNumber}}}`);
          }
          else if (this.#identify != null) {
            this.#socket.send(this.#identify);
          }
          this.#heartbeatInterval = _data.d.heartbeat_interval;
          this._maintainHeartbeat();
          return;
      }
    };
    this.#socket.onclose = (event) => {
      if (this.onClose != null) this.onClose(event);
      clearTimeout(this.#heartbeatTimeout);
      this.#isResuming = true;
      var _gatewayURL = this.gatewayURL;
      this.gatewayURL = this.#resumeGatewayURL;
      this.open();
      this.gatewayURL = _gatewayURL;
    };
    this.#socket.onerror = (event) => {
      if (this.onError != null) this.onError(event);
    };
  }
}

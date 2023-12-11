const defaultLogoURL = 'https://github.com/GleammerRay/INTERLINKED/blob/main/assets/logo.png?raw=true';

export function buildServerField(server) {
  var emoji;
  if (server.playerCount == 0) {
    emoji = '🔴';
  } else {
    emoji = '🟢';
  }
  var result =
`    <p2 class="embed-topserver-name">${emoji} ${server.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p2>
    <br>
    <p2 class="embed-topserver-label">Players: </p2>
    <p2 class="embed-topserver-value">${server.playerCount}/${server.maxPlayerCount}</p2>
    <br>
    <p2 class="embed-topserver-label">Connect: </p2>
    <a href="steam://connect/${server.address.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}"><p2 class="embed-topserver-value">steam://connect/${server.address}</p2></a>
    <br>
    <p2 class="embed-topserver-label">IP: </p2>
    <p2 class="code embed-topserver-value">${server.address.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p2>
    <br>
    <p2 class="embed-topserver-label">Map: </p2>
    <p2 class="code embed-topserver-value">${server.mapName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p2>
    <br>`;
  return result;
}

export function generateTopServersHTML(gameName, serverList, style, logoURL = defaultLogoURL) {
  var now = new Date();
  var topServer;
  if (serverList.activeServers.length == 0) topServer =
`  <div class="embed-topserver">
    <p1 class="embed-topserver-title">🔴 No active ${gameName} servers. 🔴</p1>
  </div>`;
  else {
    var server = serverList.activeServers[0];
    topServer =
`  <div class="embed-topserver">
    <p1 class="embed-topserver-title">👑 Top ${gameName} server 👑</p1>
    <br>
${buildServerField(server)}
  </div>`;
  }
  var result =
`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />
<title>
INTERLINKED
</title>
<link rel="icon" href="${logoURL}" type="image/icon type">
</head>
<style>
${style}
</style>
<body>
<a target="_blank" href="https://github.com/GleammerRay/INTERLINKED">
<div class="embed-author">
<div class="image-cropper">
<img class="embed-author-iconurl" src="${logoURL}" padding="50" width="15">
</div>
<p1 class="embed-author-name">INTERLINKED</p1>
</div>
</a>
<div class="embed-content">
  <div class="embed-status">
    <p2 class="embed-status-label">🖥️ Online servers: </p2>
    <p2 class="embed-status-value">${serverList.serverCount}</p2>
    <br>
    <p2 class="embed-status-label">🤗 Online players: </p2>
    <p2 class="embed-status-value">${serverList.playerCount}</p2>
    <br>
  </div>
${topServer}
  <div class="embed-footer">
  <div class="image-cropper">
  <img class="embed-footer-iconurl" src="https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg" padding="50" width="15">
  </div>
  <p2 class="embed-footer-text">Made by Gleammer (nice) • ${now.toUTCString()}</p2>
  </div>
</div>
</body>
</html>`;
  return result;
}

export function generateServerListHTML(gameName, serverList, style, logoURL = defaultLogoURL) {
  var now = new Date();
  var serverListHTML;
  var _servers = Object.values(serverList.servers);
  if (_servers.length == 0) serverListHTML =
  `  <div class="embed-topserver">
      <p1 class="embed-topserver-title">No online ${gameName} servers. 🌪️</p1>
      <br>`;
  else if (serverList.activeServers.length == 0) serverListHTML =
`  <div class="embed-topserver">
    <p1 class="embed-topserver-title">🔴 No active ${gameName} servers. 🔴</p1>
    <br>`;
  else serverListHTML =
`  <div class="embed-topserver">
    <p1 class="embed-topserver-title">${gameName} servers list:</p1>
    <br>`;
  var _addedServers = [];
  if (serverList.activeServers.length != 0) {
    for (var i = 0; i != serverList.activeServers.length; i++) {
      var _server = serverList.activeServers[i];
      serverListHTML += buildServerField(_server);
      _addedServers.push(_server.address);
    }
  }
  if (_servers.length != 0) {
    for (var i = 0; i != _servers.length; i++) {
      var _server = _servers[i];
      if (_addedServers.includes(_server.address)) continue;
      if (_server.playerCount != 0) continue;
      serverListHTML += buildServerField(_server);
    }
  }
  serverListHTML += '  </div>';
  var result =
`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />
<title>
INTERLINKED
</title>
<link rel="icon" href="${logoURL}" type="image/icon type">
</head>
<style>
${style}
</style>
<body>
<a target="_blank" href="https://github.com/GleammerRay/INTERLINKED">
<div class="embed-author">
<div class="image-cropper">
<img class="embed-author-iconurl" src="${logoURL}" padding="50" width="15">
</div>
<p1 class="embed-author-name">INTERLINKED</p1>
</div>
</a>
<div class="embed-content">
  <div class="embed-status">
    <p2 class="embed-status-label">🖥️ Online servers: </p2>
    <p2 class="embed-status-value">${serverList.serverCount}</p2>
    <br>
    <p2 class="embed-status-label">🤗 Online players: </p2>
    <p2 class="embed-status-value">${serverList.playerCount}</p2>
    <br>
  </div>
${serverListHTML}
  <div class="embed-footer">
  <div class="image-cropper">
  <img class="embed-footer-iconurl" src="https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg" padding="50" width="15">
  </div>
  <p2 class="embed-footer-text">Made by Gleammer (nice) • ${now.toUTCString()}</p2>
  </div>
</div>
</body>
</html>`;
  return result;
}

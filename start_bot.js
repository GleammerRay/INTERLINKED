import { Interlinked, InterlinkedDiscordJSON } from './lib/interlinked.js';
import * as fs from 'fs';

const configPath = 'config.json';
const discordBotTokenErrMsg = 'ERROR:Discord bot token not found in \'config.json\'';
const steamAPIKeyErrMsg = 'ERROR:Steam API key not found in \'config.json\'';
const prefsFilePath = 'usrprefs.json';

function onSave(json) {
  fs.writeFileSync(prefsFilePath, JSON.stringify(json));
}

function run() {
  try {
    fs.accessSync(configPath);
  } catch (err) {
    console.log('ERROR:Config not found under \'config.json\'');
    return;
  }
  var _config = eval(`(${fs.readFileSync('config.json')})`);
  if (_config.discordBotToken == null) {
    console.log(discordBotTokenErrMsg);
    return;
  }
  if (_config.discordBotToken == '') {
    console.log(discordBotTokenErrMsg);
    return;
  }
  if (_config.steamAPIKey == null) {
    console.log(steamAPIKeyErrMsg);
    return;
  }
  if (_config.steamAPIKey == '') {
    console.log(steamAPIKeyErrMsg);
    return;
  }
  
  try {
    fs.accessSync(prefsFilePath);
  } catch (e) {
    var _fd = fs.openSync(prefsFilePath, 'w+');
    fs.writeSync(_fd, JSON.stringify(new InterlinkedDiscordJSON().toJSON()));
    fs.closeSync(_fd);
  }
  
  var _interlinked = new Interlinked(
    _config,
    fs.readFileSync(prefsFilePath, { encoding: 'utf8', flag: 'r' }),
    (json) => onSave(json),
    console.log,
  );
  _interlinked.start();
}

run();

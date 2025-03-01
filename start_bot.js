import * as fs from 'fs';
import * as path from'path';
import { spawn } from 'child_process';
import { Interlinked, InterlinkedDiscordJSON } from './lib/interlinked.js';

const configPath = path.join(process.cwd(), 'config.json');
const discordBotTokenErrMsg = 'F:Discord bot token not found in \'config.json\'\n';
const steamAPIKeyErrMsg = 'F:Steam API key not found in \'config.json\'\n';
const prefsFilePath = path.join(process.cwd(), 'usrprefs.json');

var isQuiet = false;
var logPath = path.join(process.cwd(), 'bot.log');
var shouldRestart = false;

function _displayHelp() {
  console.log(
    'Options:' +
    '\n-h / --help			Display this page.' +
    '\n-q / --quiet\n Do not log info and warnings into console.\n  The \'-s\' option will not be affected.' +
    '\n-s / --save-log\n	Save script log to a file.\n	Default path is \'bot.log\' in parent directory, custom path can be specified with \'-o\'.' +
    '\n-o / --output <filepath>	Specify a custom log output file path instead of \'bot.log\'.' +
    '\n-r / --restart			Automatically restart this script on crash.' +
    '\n--raw\n	Execute a raw run.\n	The script will ignore all options and its output will not be formatted.'
  );
}

function log(value) {
  if (typeof value != 'string') {
    value = value.toString();
  }
  if (isQuiet) {
    var _0 = value[0];
    if (_0 != 'F' && _0 != 'S') return;
    if (value[1] != ':') return;
  }
  console.log(value.slice(0, -1));
}

function runRaw() {
  function onSave(json) {
    fs.writeFileSync(prefsFilePath, JSON.stringify(json));
  }
  
  try {
    fs.accessSync(configPath);
  } catch (err) {
    log('F:Config not found under \'config.json\'\n');
    process.exit(1);
  }
  var _config = null;
  try {
    _config = JSON.parse(fs.readFileSync('config.json'));
  }
  catch (e) {
    log(`F:Invalid JSON in \'config.json\'\n${e}\n`);
    process.exit(1);
  }
  if (_config.discordBotToken == null) {
    log(discordBotTokenErrMsg);
    process.exit(1);
  }
  if (_config.discordBotToken == '') {
    log('W:Discord bot token is empty, will not use Discord bot features.\n');
  }
  if (_config.steamAPIKey == null) {
    log(steamAPIKeyErrMsg);
    process.exit(1);
  }
  if (_config.steamAPIKey == '') {
    log(steamAPIKeyErrMsg);
    process.exit(1);
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
  var _exitDone = false;
  function exit() {
    if (_exitDone) return;
    _exitDone = true;
    _interlinked.stop();
    console.log('S:Waiting 5 seconds for any file operations to finish.');
    setTimeout((function() {
      return process.exit(0);
    }), 5000);
  }
  process.on('SIGINT', () => exit());
  process.on('SIGTERM', () => exit());
  _interlinked.start();
}

function main() {
  function onSaveLog() {
    log = (value) => {
      if (typeof value != 'string') {
        value = value.toString();
      }
      fs.appendFileSync(logPath, value);
      if (isQuiet) {
        var _0 = value[0];
        if (_0 != 'F' && _0 != 'S') return;
        if (value[1] != ':') return;
      }
      console.log(value.slice(0, -1));
    };
  }
  
  for (var i = 0; i != process.argv.length; i++) {  
    function _onOutput(onMissing) {
      if (i == process.argv.length - 1) {
        log(`F:Command option \'${process.argv[i]}\' is missing a value.\n`);
        process.exit(1);
      }
      logPath = process.argv[++i];
    }
  
    switch (process.argv[i]) {
      case '--raw':
        runRaw();
        return;
      case 'help':
        _displayHelp();
        return;
      case '-h':
        _displayHelp();
        return;
      case '--help':
        _displayHelp();
        return;
      case '-q':
        isQuiet = true;
        break;
      case '--quiet':
        isQuiet = true;
        break;
      case '-s':
        onSaveLog();
        break;
      case '--save-log':
        onSaveLog();
        break;
      case '-o':
        _onOutput();
        break;
      case '--output':
        _onOutput();
        break;
      case '-r':
        shouldRestart = true;
        break;
      case '--restart':
        shouldRestart = true;
        break;
    }
  }
  
  async function runBot(onClose = null) {
    var child = spawn('node', ['start_bot.js', '--raw']);
    child.stdout.on('data', (data) => {
      log(data);
    });  
    child.stderr.on('data', (data) => {
      log(`F:\n ${data}`);
    });  
    child.on('close', (code) => {
      log(`S:Bot exited with code ${code}.\n`);
      if (onClose != null) onClose();
    });
  }
  
  if (shouldRestart) {
    function _restartBot() {
      log('S:Restarting.\n');
      runBot(() => _restartBot());  
    }
    runBot(() => _restartBot());
    return;
  }
  
  runBot();
}

main();

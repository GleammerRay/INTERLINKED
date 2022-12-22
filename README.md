# INTERLINKED

At first this was just a [NEOTOKYO°](https://store.steampowered.com/app/244630/NEOTOKYO/) pub bot, but now it supports *all* source game servers! 🌌

![](https://github.com/GleammerRay/NTInterlinked/raw/main/assets/poster.png)

## Contents
1. [Setting up the bot in Discord](#setting-up-the-bot-in-discord)
2. [Discord slash commands](#discord-slash-commands)
   - [User commands](#user-commands)
   - [Admin commands](#admin-commands)
3. [INTERLINKED variables](#interlinked-variables)
4. [Setting up your own INTERLINKED application](#setting-up-your-own-interlinked-application)
   1. [Creating a link](#1-creating-a-link)
   2. [Setting up the config](#2-setting-up-the-config)
   3. [Running the bot with NodeJS](#3-running-the-bot-with-nodejs)
   4. [Making backups](#4-making-backups)
   5. [Updating](#5-updating)
   6. [Logging](#6-logging)
5. [Command line arguments](#command-line-arguments)
6. [Library](#library)

## Setting up the bot in Discord
1. Invite one of the currently available bots:
   - [NEOTOKYO° (Official)](https://discord.com/api/oauth2/authorize?client_id=1005270180768792716&permissions=268437504&scope=bot) - by Gleammer#5946
   - [Fortress Forever](https://discord.com/api/oauth2/authorize?client_id=1017091888521695272&permissions=268437504&scope=bot) - by philchute#7727
2. Go to `Server Settings` -> `Integrations` -> `Bots and Apps` -> `<game name> INTERLINKED`.
3. Set channels and roles for commands that you want to use.
4. Enjoy! 🍻

## Discord slash commands

### User commands

- `/help` - List all available commands.
- `/update` - Get a list of active game servers.
- `/pub` - Add ping role for user.
- `/unpub` - Remove ping role for user.
- `/get` - Get an INTERLINKED variable.

### Admin commands

- `/reset` - Reset an INTERLINKED variable.
- `/set` - Set an INTERLINKED variable for this guild.
- `/subscribe` - Subscribe channel to receive automatic updates about active game servers.
- `/unsubscribe` - Unsubscribe channel from receiving automatic updates about active game servers.
- `/blacklist` - Blacklist a server from the servers list.
- `/unblacklist` - Unblacklist a server from the servers list.

## INTERLINKED variables

- `admin_role` - Role that has access to INTERLINKED admin-only commands.
- `max_server_count` - Maximum number of servers in the server list.
- `subscribed_channels` - Channels subscribed to receive automatic server updates.
- `min_player_count` - Minimum player count to trigger suscription feed.
- `subscription_feed_min_rate` - Minimum time between two automatic updates.
- `ping_role` - Role that that is pinged about active game servers.
- `ping_min_rate` - Minimum time between two pings.
- `ping_min_player_count` - Minimum player count to trigger ping.
- `blacklist` - Blacklisted servers.

## Setting up your own INTERLINKED application

In case you want to run a bot of your own for a game of your choice, you can!

Make sure to download the [latest bot release](https://github.com/GleammerRay/INTERLINKED/releases) before proceeding.

### 1. Creating a link
1. Go to [Discord Developer Portal - My Applications](https://discord.com/developers/applications) and create a new application. [A tutorial can be found here](https://github.com/discord-apps/bot-tutorial).
2. Go to URL Generator under OAuth2 and select bot scope with permissions to send messages and to manage roles.
3. Use the generated URL to invite the bot. 🤖

### 2. Setting up the config

1. Make a copy of `.config.json` named `config.json` (removing the dot in the beginning).
2. Specify the `steamAppID` and `gameName` of your game in the `config.json`. Default values are for NEOTOKYO°.
3. Specify your Discord bot token in `discordBotToken` in the `config.json`. You can get it from the bot section of your Discord application.
4. If the default value for `steamMasterServerAddress` does not work, please consult with [1.3 Master servers](https://developer.valvesoftware.com/wiki/Master_Server_Query_Protocol#Master_servers) on Master Server Query Protocol at Valve developer community wiki.
5. If you wish to use different images, add the links of desired images to `activeImageURLs`, `fridayImageURLs` (will only show on fridays, if none are specified then images from `activeImageURLs` are used) and `mapImageURLs` (add entries in format `"<map name>": "<image url>"` (without angle brackets)).
6. You are ready to run your bot! 🦸


### 3. Running the bot with NodeJS

1. Get [NodeJS](https://nodejs.org/en/download/) (and npm if you're on linux).
2. Run `npm ci` in the root of bot directory to install dependencies.
3. Run `node start_bot.js` to run the bot. 🏃

### 4. Making backups

All bot generated preferences including per-server preferences are saved in `usrprefs.json`. Make sure to back up this file regularly to avoid data loss. 

### 5. Updating

1. [Download and extract the latest available release](https://github.com/GleammerRay/INTERLINKED/releases).
2. Run `npm ci` in the root of bot directory to install dependencies.
3. Copy your `config.json` and `usrprefs.json` from old installation to the newly acquired release.
4. Enjoy the latest features! ⚡

### 6. Logging

By default, INTERLINKED is logging to your console.

If you wish to save the log, specify the `-s` or `--save-log` argument when running the bot. The log will then be saved to `bot.log` inside bot's directory.

Log message types:
- `I` - Informational message: contains relevant information about what the bot is doing.
- `W` - Warning: notifies about something that can cause runtime issues.
- `E` - Error: an unresolved runtime error. The bot will keep working, but its behaviour is not guaranteed.
- `F` - Fatal error: an error that caused the bot to crash.
- `S` - System message: contains relevant information about the bot process.

## Command line arguments

- `-h` / `--help` - Display help page.
- `-q` / `--quiet` - Do not log info and warnings into console. The `-s` option will not be affected.
- `-s` / `--save-log` - Save script log to a file. Default path is `bot.log` in parent directory, custom path can be specified with `-o`.
- `-o` / `--output <filepath>` - Specify a custom log output file path instead of `bot.log`.
- `-r` / `--restart` - Automatically restart the script on crash.
- `--raw` - Execute a raw run. The script will ignore all options and its output will not be formatted.

## Library

Library exports:
- `InterlinkedServer` - An active (>0 players) game server.
- `InterlinkedServerList` - Contains a list of active game servers along with total server and player count. 
- `InterlinkedGuild` - A guild that uses the INTERLINKED bot. Contains guild preferences and methods to operate on them.
- `InterlinkedDiscordJSON` - Bot preferences as they are stored in JSON.
- `InterlinkedDiscord` - Bot preferences and methods to operate on them. An additional function can be specified to save preferences.
- `Interlinked` - Discord bot. Provides `start()` and `stop()` methods.

#### Made with 💜 by Gleammer.

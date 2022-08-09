# NEOTOKYO° INTERLINKED

![](https://github.com/GleammerRay/NTInterlinked/raw/main/assets/poster.png)

## Contents
1. [Setting up the bot in Discord](#setting-up-the-bot-in-discord)
2. [Setting up your own INTERLINKED application](#setting-up-your-own-discord-bot-application)
3. [Library](#library)

## Setting up the bot in Discord
1. Invite the bot by going [here](https://discord.com/api/oauth2/authorize?client_id=1005270180768792716&permissions=268437504&scope=bot).
2. Go to `Server Settings` -> `Integrations` -> `Bots and Apps` -> `NEOTOKYO° INTERLINKED`.
3. Set channels and roles for commands that you want to use.
4. Enjoy! 🍻

## Setting up your own Discord bot application

In case you want to run the bot on your own, you can!

Download the bot files before proceeding.

### 1. Creating a link
1. Go to [Discord Developer Portal - My Applications](https://discord.com/developers/applications) and create a new application. [A tutorial can be found here](https://github.com/discord-apps/bot-tutorial).
2. Go to URL Generator under OAuth2 and select bot scope with permissions to send messages and to manage roles.
3. Use the generated URL to invite the bot. 🤖

### 2. Setting up the config

1. Make a copy of `.config.json` named `config.json` (removing the dot in the beginning).
2. Specify your Discord bot token in `discordBotToken` in the `config.json`. You can get it from the bot section of your Discord application.
3. Specify your [Steam API key](https://steamcommunity.com/dev/apikey) in `steamAPIKey` in `config.json`.
4. If you wish to use different images, add the links of desired images to `activeImageURLs` and `fridayImageURLs` (will only show on fridays, if none are specified then images from `activeImageURLs are used).
5. You are ready to run your bot! 🦸


### 3. Running the bot with NodeJS

1. Get [NodeJS](https://nodejs.org/en/download/) (and npm if you're on linux).
2. Run `npm install` in the root of bot directory to install dependencies.
3. Run `nodejs start_bot.json` to run the bot. 🏃

## Library

Library exports:
- `NTServer` - An active (>0 players) NEOTOKYO° server.
- `NTServerList` - Contains a list of active NEOTOKYO° servers along with total server and player count. 
- `NTIGuild` - A guild that uses the NEOTOKYO° INTERLINKED bot. Contains guild preferences and methods to operate on them.
- `NTIDiscordJSON` - Bot preferences as they are stored in JSON.
- `NTIDiscord` - Bot preferences and methods to operate on them. An additional function can be specified to save preferences.
- `NTInterlinked` - Discord bot. Provides `start()` and `stop()` methods.

#### Made with 💜 by Gleammer.

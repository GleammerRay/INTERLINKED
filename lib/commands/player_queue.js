import * as common from '../common.js';
Object.assign(global, common);

const commandSignatures = [
  // Only used for internal registration
  {
    name: 'player_queue',
    description: 'Useful command - Lorem Ipsum',
    dm_permission: false,
    type: 1,
  },
];

const buttonSignatures = [
  {
    id: 'player_queue',
  },
];

class Command {
  rest;
  db;
  burstStackManager;

  constructor(options) {
    this.rest = options.rest;
    this.db = options.db;
    this.burstStackManager = options.burstStackManager;
  }

  async execute(interaction) {
    return await this.rest.createEphemeralInteractionResponse(interaction, { content: 'Hello World!【=◕‿↼✿=】' });
  }

  async executeButton(interaction) {
    const customId = interaction.data.custom_id.split(' ');
    const playerQueue = this.db.get(`guilds/${interaction.guild_id}/player_queue.json`, defaultPlayerQueue);
    var arg1 = 0;
    var arg2 = null;
    var arg3 = null;
    var type;
    if (customId.length > 1) {
      type = 7;
      try {
        arg1 = parseInt(customId[1]);
      } catch (_) {}
      if (arg1 == null) arg1 = 0;
      if (arg1 > playerQueue.length) arg1 = 0;
      if (customId.length > 2) arg2 = customId[2];
      if (customId.length > 3) {
        try {
          arg3 = parseInt(customId[3]);
        } catch (_) {
          arg3 = 5;
        }
      }
    } else type = 4;
    const userId = interaction.member.user.id;
    var playerQueue1 = playerQueue[arg1];
    var userPlayer = null;
    var userFound = false;
    var userDiscounted = false;
    var shouldSave = false;
    var interest5 = 0;
    var interest10 = 0;
    var interest15 = 0;
    var discount = 0;
    var i = 0;
    if (playerQueue1.startTime != null) {
      var discount = Math.floor((((Date.now() - parseInt(playerQueue1.startTime)) / 1000) / 60) / 60) - playerQueue1.recount;
      // Reset after 12 hours
      if (discount > 12) {
        playerQueue1 = { startTime: null, recount: 0, players: {} };
        playerQueue[arg1] = playerQueue1;
        shouldSave = true;
      }
      for (const playerId in playerQueue1.players) {
        if (playerId == userId) {
          userFound = true;
          userPlayer = playerQueue1.players[playerId];
        }
        if (i < discount) {
          if (playerId == userId) userDiscounted = true;
          i++;
          continue;
        }
        i++;
        const player = playerQueue1.players[playerId];
        if (player.interest <= 5) {
          interest5++;
          interest10++;
          interest15++;
          continue;
        }
        if (player.interest <= 10) {
          interest10++;
          interest15++;
          continue;
        }
        if (player.interest <= 15) interest15++;
      }
    }
    if (!userFound) {
      if (arg2 == 'join') {
        userFound = true;
        if (playerQueue1.startTime == null) {
          playerQueue1.startTime = Date.now().toString();
          playerQueue1.recount = 0;
        }
        const player = { pinged: false, interest: arg3 };
        if (discount > Object.keys(playerQueue1.players).length - 1) {
          playerQueue1.recount += discount - Object.keys(playerQueue1.players).length;
        }
        playerQueue1.players[userId] = player;
        shouldSave = true;
        if (player.interest <= 5) {
          interest5++;
          interest10++;
          interest15++;
        }
        else if (player.interest <= 10) {
          interest10++;
          interest15++;
        }
        else if (player.interest <= 15) interest15++;
      }
    } else {
      if (userDiscounted) {
        if (arg2 == 'join') {
          // re-join
          userDiscounted = false;
          userPlayer.pinged = false;
          delete playerQueue1.players[userId];
          if (discount > Object.keys(playerQueue1.players).length - 1) {
            playerQueue1.recount += discount - Object.keys(playerQueue1.players).length;
          }
          playerQueue1.players[userId] = userPlayer;
          shouldSave = true;
          if (userPlayer.interest <= 5) {
            interest5++;
            interest10++;
            interest15++;
          }
          else if (userPlayer.interest <= 10) {
            interest10++;
            interest15++;
          }
          else if (userPlayer.interest <= 15) interest15++;
        }
      } else if (arg2 == 'leave') {
        userFound = false;
        delete playerQueue1.players[userId];
        if (playerQueue1.startTime != null) {
          if (userPlayer.interest <= 5) {
            interest5--;
            interest10--;
            interest15--;
          }
          else if (userPlayer.interest <= 10) {
            interest10--;
            interest15--;
          }
          else if (userPlayer.interest <= 15) interest15--;
        }
        if (Object.keys(playerQueue1.players).length == 0) {
          playerQueue1.startTime = null;
          playerQueue1.recount = 0;
        }
        shouldSave = true;
      }
    }
    if (shouldSave) {
      var playersToPing = [];
      for (const playerId in playerQueue1.players) {
        const player = playerQueue1.players[playerId];
        if (player.pinged) continue;
        if (interest15 >= player.interest) {
          playersToPing.push(playerId);
          player.pinged = true;
        }
      }
      this.db.set(`guilds/${interaction.guild_id}/player_queue.json`, playerQueue);
      if (playersToPing.length != 0) {
        const message = `> Player queue ${arg1 + 1} is ready - **${interest15} players** - join up! https://discord.com/channels/${interaction.guild_id}/${interaction.channel_id}`;
        dmUsers(this.rest, playersToPing, { content: message });
      }
    }
    var custom_id;
    var label;
    var style;
    if (userFound) {
      custom_id = `player_queue ${arg1} leave`;
      label = 'Leave';
      style = 4;
    } else {
      custom_id = `player_queue ${arg1} join`;
      label = 'Ping on';
      style = 3;
    }
    var playerQueueComponents = [
      userFound ? {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: custom_id,
            label: label,
            style: style,
          },
        ],
      } : {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: custom_id + ' 5',
            label: label + ' 5',
            style: style,
          },
          {
            type: 2,
            custom_id: custom_id + ' 10',
            label: label + ' 10',
            style: style,
          },
          {
            type: 2,
            custom_id: custom_id + ' 15',
            label: label + ' 15',
            style: style,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: `player_queue ${arg1} refresh`,
            label: 'Refresh',
            style: 2,
            emoji: {
              id: null,
              name: '🔄',
            },
          },
        ],
      },
    ];
    if (userDiscounted) {
      playerQueueComponents.splice(
        0, 0,
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: `player_queue ${arg1} join`,
              label: 'You are discounted - re-join or leave',
              style: 2,
              emoji: {
                id: null,
                name: '⚠️',
              },
            },
          ],
        },
      );
    }
    var playerQueueEmbed = {
      title: 'Player queue 1',
      footer: {
        icon_url:'https://cdn.discordapp.com/attachments/1005272489380827199/1005581705035399198/gleam.jpg',
        text:'Made by Gleammer (nice)',
      },
      description: `
\`\`\`py
╔═════════╦═════════╦═════════╗
║   5+    ║   10+   ║   15+   ║
╠═════════╬═════════╬═════════╣
║ ${interest5 < 10 ? ' ' : ''}${interest5} / 5  ║ ${interest10} / 10${interest10 < 10 ? ' ' : ''} ║ ${interest15} / 15${interest15 < 10 ? ' ' : ''} ║
╚═════════╩═════════╩═════════╝
\`\`\`
-# **Table Legend**
-# - 5+ - Ping me once 5 or more players are interested.
-# - 10+ - Ping me once 10 or more players are interested.
-# - 15+ - Ping me once 15 or more players are interested.

-# Player interest is discounted by 1 every hour there has not been a ping.
-# If you get discounted from the player queue, you will still get pinged if enough interest is gathered but **will need to join again to confirm your interest**.`
    };
    return await this.rest.createInteractionResponse(interaction, { type: type, data: { flags: 1 << 6, embeds: [ playerQueueEmbed ], components: playerQueueComponents } });
  }
}

export { commandSignatures, buttonSignatures, Command };

console.log('Beep beep');

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.DJS_TOKEN);

let connections = [];
let servers = [];

setInterval(() => {
  console.log(connections);
  console.log('######################');
  console.log(servers);
}, 600000);

client.on('ready', () => {
  console.log('❤');
  client.user.setActivity('Type p!help');
});

client.on('message', async (message) => {
  if (!message.guild) return;

  const args = message.content.trim().split(' ');

  if (args[0] === 'p!start') {
    console.log('start: ' + message.member);
    if (servers.includes(message.guild.id)) {
      message.channel.send("There's a pomodoro already running!");
      return;
    }

    if (message.member.voice.channel) {
      var pomodoreStatus = {
        time: 1,
        timeShow: true,
        status: false,
        minutes: [1500000, 300000, 900000],
        peopleToDm: [],
        textAlerts: true,
        volume: 0.5,
        voiceChannelId: 0,
        timer: null,
        dispatcher: null,
        timerStartedTime: new Date(),
        connection: null,
      };

      if (args[1]) {
        if (
          parseInt(args[1]) < 1 ||
          parseInt(args[1] > 120 || isNaN(parseInt(args[1]))) ||
          isNaN(parseInt(args[1]))
        ) {
          message.channel.send(
            'Insert a valid time between 1 and 120 minutes!'
          );
          return false;
        } else {
          pomodoreStatus.minutes[0] = parseInt(args[1] * 60000);
        }
      }

      if (args[2]) {
        if (
          parseInt(args[2]) < 1 ||
          parseInt(args[2] > 120) ||
          isNaN(parseInt(args[2]))
        ) {
          message.channel.send(
            'Insert a valid time between 1 and 120 minutes!'
          );
          return false;
        } else {
          pomodoreStatus.minutes[1] = parseInt(args[2] * 60000);
        }
      }

      if (args[3]) {
        if (
          parseInt(args[3]) < 1 ||
          parseInt(args[3] > 120) ||
          isNaN(parseInt(args[3]))
        ) {
          message.channel.send(
            'Insert a valid time between 1 and 120 minutes!'
          );
          return false;
        } else {
          pomodoreStatus.minutes[2] = parseInt(args[3] * 60000);
        }
      }

      pomodoreStatus.connection = await message.member.voice.channel.join();

      connections.push(pomodoreStatus);
      servers.push(pomodoreStatus.connection.channel.guild.id);

      connections[servers.indexOf(message.guild.id)].status = true;
      connections[servers.indexOf(message.guild.id)].time = 1;

      const startANewCycle = () => {
        if (
          servers.indexOf(message.guild.id) != -1 &&
          connections[servers.indexOf(message.guild.id)].time % 2 != 0 &&
          connections[servers.indexOf(message.guild.id)].status
        ) {
          connections[
            servers.indexOf(message.guild.id)
          ].timerStartedTime = new Date();

          connections[
            servers.indexOf(message.guild.id)
          ].dispatcher = connections[
            servers.indexOf(message.guild.id)
          ].connection.play('./sounds/time-over.ogg', {
            volume: connections[servers.indexOf(message.guild.id)].volume,
          });

          connections[servers.indexOf(message.guild.id)].dispatcher.on(
            'finish',
            () => {
              connections[
                servers.indexOf(message.guild.id)
              ].dispatcher = connections[
                servers.indexOf(message.guild.id)
              ].connection.play('./sounds/silence-fixer.ogg');
            }
          );

          connections[servers.indexOf(message.guild.id)].timer = setTimeout(
            () => {
              if (servers.indexOf(message.guild.id) != -1) {
                connections[servers.indexOf(message.guild.id)].time++;

                if (
                  connections[servers.indexOf(message.guild.id)].status &&
                  pomodoreStatus.textAlerts
                ) {
                  message.channel.send(
                    `You worked for ${
                      connections[servers.indexOf(message.guild.id)]
                        .minutes[0] / 60000
                    }min! Time for a small break of ${
                      connections[servers.indexOf(message.guild.id)]
                        .minutes[1] / 60000
                    }min!`
                  );
                }

                if (
                  servers.indexOf(message.guild.id) != -1 &&
                  connections[servers.indexOf(message.guild.id)].peopleToDm &&
                  connections[servers.indexOf(message.guild.id)].peopleToDm
                    .length > 0
                ) {
                  connections[
                    servers.indexOf(message.guild.id)
                  ].peopleToDm.forEach((person) => {
                    client.users.cache
                      .get(person)
                      .send(
                        `You worked for ${
                          connections[servers.indexOf(message.guild.id)]
                            .minutes[0] / 60000
                        }min! Time for a small break of ${
                          connections[servers.indexOf(message.guild.id)]
                            .minutes[1] / 60000
                        }min!`
                      );
                  });
                }

                startANewCycle();
              } else {
                voiceChannel.leave();
                return;
              }
            },
            connections[servers.indexOf(message.guild.id)].minutes[0]
          );
        } else if (
          servers.indexOf(message.guild.id) != -1 &&
          connections[servers.indexOf(message.guild.id)].time % 2 == 0 &&
          connections[servers.indexOf(message.guild.id)].time != 8 &&
          connections[servers.indexOf(message.guild.id)].status
        ) {
          connections[
            servers.indexOf(message.guild.id)
          ].timerStartedTime = new Date();

          connections[
            servers.indexOf(message.guild.id)
          ].dispatcher = connections[
            servers.indexOf(message.guild.id)
          ].connection.play('./sounds/time-over.ogg', {
            volume: connections[servers.indexOf(message.guild.id)].volume,
          });

          connections[servers.indexOf(message.guild.id)].dispatcher.on(
            'finish',
            () => {
              connections[
                servers.indexOf(message.guild.id)
              ].dispatcher = connections[
                servers.indexOf(message.guild.id)
              ].connection.play('./sounds/silence-fixer.ogg');
            }
          );

          connections[servers.indexOf(message.guild.id)].timer = setTimeout(
            () => {
              if (servers.indexOf(message.guild.id) != -1) {
                connections[servers.indexOf(message.guild.id)].time++;

                if (
                  servers.indexOf(message.guild.id) != -1 &&
                  connections[servers.indexOf(message.guild.id)].status &&
                  connections[servers.indexOf(message.guild.id)].textAlerts
                ) {
                  message.channel.send(
                    `You finished your ${
                      connections[servers.indexOf(message.guild.id)]
                        .minutes[1] / 60000
                    }min break! Let's get back to work again!`
                  );
                }

                if (
                  connections[servers.indexOf(message.guild.id)].peopleToDm &&
                  connections[servers.indexOf(message.guild.id)].peopleToDm
                    .length > 0 &&
                  servers.indexOf(message.guild.id) != -1
                ) {
                  connections[
                    servers.indexOf(message.guild.id)
                  ].peopleToDm.forEach((person) => {
                    client.users.cache
                      .get(person)
                      .send(
                        `You finished your ${
                          connections[servers.indexOf(message.guild.id)]
                            .minutes[1] / 60000
                        }min break! Let's get back to work again!`
                      );
                  });
                }

                startANewCycle();
              } else {
                voiceChannel.leave();
                return;
              }
            },
            connections[servers.indexOf(message.guild.id)].minutes[1]
          );
        } else if (
          servers.indexOf(message.guild.id) != -1 &&
          connections[servers.indexOf(message.guild.id)].time == 8 &&
          connections[servers.indexOf(message.guild.id)].status
        ) {
          connections[
            servers.indexOf(message.guild.id)
          ].timerStartedTime = new Date();

          connections[
            servers.indexOf(message.guild.id)
          ].dispatcher = connections[
            servers.indexOf(message.guild.id)
          ].connection.play('./sounds/time-over.ogg', {
            volume: connections[servers.indexOf(message.guild.id)].volume,
          });

          connections[servers.indexOf(message.guild.id)].dispatcher.on(
            'finish',
            () => {
              connections[
                servers.indexOf(message.guild.id)
              ].dispatcher = connections[
                servers.indexOf(message.guild.id)
              ].connection.play('./sounds/silence-fixer.ogg');
            }
          );

          connections[servers.indexOf(message.guild.id)].timer = setTimeout(
            () => {
              if (servers.indexOf(message.guild.id) != -1) {
                connections[servers.indexOf(message.guild.id)] = 1;

                if (
                  connections[servers.indexOf(message.guild.id)].status &&
                  connections[servers.indexOf(message.guild.id)].textAlerts &&
                  servers.indexOf(message.guild.id) != -1
                ) {
                  message.channel.send(
                    `You finished your ${
                      connections[servers.indexOf(message.guild.id)]
                        .minutes[2] / 60000
                    }min break! Let's get back to work again!`
                  );
                }

                if (
                  connections[servers.indexOf(message.guild.id)].peopleToDm &&
                  connections[servers.indexOf(message.guild.id)].peopleToDm
                    .length > 0 &&
                  servers.indexOf(message.guild.id) != -1
                ) {
                  connections[
                    servers.indexOf(message.guild.id)
                  ].peopleToDm.forEach((person) => {
                    client.users.cache
                      .get(person)
                      .send(
                        `You finished your ${
                          connections[servers.indexOf(message.guild.id)]
                            .minutes[2] / 60000
                        }min break! Let's get back to work again!`
                      );
                  });
                }

                startANewCycle();
              } else {
                voiceChannel.leave();
                return;
              }
            },
            connections[servers.indexOf(message.guild.id)].minutes[2]
          );
        } else {
          return;
        }
      };

      //Start the timer for the first time
      message.channel.send("Pomodoro started! Let's get to work!");

      startANewCycle();
    } else {
      //If the dude who called the command is not in a voice channel
      message.reply('You need to join a voice channel first!');
    }
  }

  //Remove bot from voice channel
  if (message.content === 'p!stop') {
    if (!message.member.voice.channel) {
      message.reply('You are not in a voice channel!');
      return;
    }

    if (servers.indexOf(message.guild.id) == -1) {
      message.channel.send("There's no pomodoro running");
      return;
    } else {
      if (!connections[servers.indexOf(message.guild.id)].status) {
        message.channel.send("There's no pomodoro currently running!");
        return;
      }

      message.channel.send('Nice work! Glad I could help!');
      message.member.voice.channel.leave();

      connections.splice(servers.indexOf(message.guild.id), 1);
      servers.splice(servers.indexOf(message.guild.id), 1);
    }
  }

  //Status command
  if (message.content === 'p!status') {
    if (
      servers.indexOf(message.guild.id) != -1 &&
      connections[servers.indexOf(message.guild.id)].status
    ) {
      let now = new Date();
      let timePassed =
        now.getTime() -
        connections[
          servers.indexOf(message.guild.id)
        ].timerStartedTime.getTime();
      let timeLeft;

      if (
        servers.indexOf(message.guild.id) != -1 &&
        connections[servers.indexOf(message.guild.id)].time % 2 != 0
      ) {
        timeLeft = parseInt(
          (connections[servers.indexOf(message.guild.id)].minutes[0] -
            timePassed) /
            60000
        );
        message.channel.send(
          `${timeLeft + 1}min left to your break! Keep it up!`
        );
      } else if (
        servers.indexOf(message.guild.id) != -1 &&
        connections[servers.indexOf(message.guild.id)].time % 2 == 0 &&
        connections[servers.indexOf(message.guild.id)].time != 8
      ) {
        timeLeft = parseInt(
          (connections[servers.indexOf(message.guild.id)].minutes[1] -
            timePassed) /
            60000
        );
        message.channel.send(`${timeLeft + 1}min left to start working!`);
      } else {
        timeLeft = parseInt(
          (connections[servers.indexOf(message.guild.id)].minutes[2] -
            timePassed) /
            60000
        );
        message.channel.send(`${timeLeft + 1}min left to start working!`);
      }
    } else {
      message.channel.send(`You haven't started a pomodoro timer yet`);
    }
  }

  //Help command
  if (message.content === 'p!help') {
    const helpCommands = new Discord.MessageEmbed()
      .setColor('#f00')
      .setTitle('Pomodore commands')
      .setDescription('Here is the list of commands to use the bot!')
      .addFields(
        {
          name: 'Start the pomodoro with default values (25, 5, 15)',
          value: 'p!start',
        },
        {
          name: 'Start the pomodoro with specific values',
          value: 'p!start [work time] [small break time] [big break time]',
        },
        { name: 'Stop the pomodoro', value: 'p!stop' },
        {
          name: 'Check the current status of the pomodoro',
          value: 'p!status',
        },
        {
          name: 'Toggle the notifications via direct message',
          value: 'p!dm',
        },
        { name: 'Toggle the channel text notifications', value: 'p!togtext' },
        {
          name: 'Change the volume of the alerts, defaults to 50',
          value: 'p!volume volume',
        },
        { name: 'Get the list of commands', value: 'p!help' }
      );
    message.author.send(helpCommands);
  }

  //Send alerts via DM
  if (message.content === 'p!dm') {
    if (servers.indexOf(message.guild.id) == -1) {
      message.channel.send("There's no pomodoro running!");
      return;
    }
    if (
      connections[servers.indexOf(message.guild.id)].peopleToDm.includes(
        message.author.id && servers.indexOf(message.guild.id) == -1
      )
    ) {
      connections[servers.indexOf(message.guild.id)].peopleToDm = connections[
        servers.indexOf(message.guild.id)
      ].peopleToDm.filter((item) => item !== message.author.id);
      message.reply('you will stop receiving the alerts via Direct Message!');
    } else {
      connections[servers.indexOf(message.guild.id)].peopleToDm.push(
        message.author.id
      );
      message.reply('you will now receive the alerts via Direct Message!');
    }
  }

  //Toggle text notifications
  if (message.content === 'p!togtext') {
    if (
      connections[servers.indexOf(message.guild.id)].status &&
      servers.indexOf(message.guild.id) != -1
    ) {
      connections[servers.indexOf(message.guild.id)].textAlerts = !connections[
        servers.indexOf(message.guild.id)
      ].textAlerts;

      if (connections[servers.indexOf(message.guild.id)].textAlerts) {
        message.channel.send('The text notifications have been turned on!');
      } else {
        message.channel.send('The text notifications have been turned off!');
      }
    } else {
      message.channel.send("There's no pomodoro timer currently running!");
    }
  }

  if (args[0] === 'p!volume') {
    if (
      connections[servers.indexOf(message.guild.id)].status &&
      servers.indexOf(message.guild.id) != -1
    ) {
      if (args[1]) {
        if (
          parseInt(args[1]) < 1 ||
          parseInt(args[1] > 100 || isNaN(parseInt(args[1])))
        ) {
          message.channel.send(
            'Please insert a valid number between 0 and 100'
          );
        } else {
          connections[servers.indexOf(message.guild.id)].volume = args[1] / 100;
          message.channel.send(`The volume has been set to ${args[1]}`);
        }
      } else {
        message.channel.send(
          'Please type a second argument with a number between 0 and 100'
        );
      }
    } else {
      message.channel.send("There's no pomodoro timer currently running!");
    }
  }
});

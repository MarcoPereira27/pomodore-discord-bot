console.log('Beep beep');

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.DJS_TOKEN);

let timerStartedTime;
let checkTime;
var connection, dispatcher;

let pomodoreStatus = {
  time: 1,
  timeShow: true,
  status: false,
  minutes: [1500000, 300000, 900000],
  peopleToDm: [],
  textAlerts: true,
  volume: 0.5,
};

client.on('ready', () => {
  console.log('❤');
});

client.on('message', async (message) => {
  if (!message.guild) return;

  const args = message.content.trim().split(' ');

  if (args[0] === 'p!start') {
    //If there's arguments
    if (args[1]) {
      if (
        parseInt(args[1]) < 1 ||
        parseInt(args[1] > 120 || isNaN(parseInt(args[1])))
      ) {
        message.channel.send('Insert a valid time between 1 and 120 minutes!');
        return false;
      } else {
        console.log('changing time');
        pomodoreStatus.minutes[0] = parseInt(args[1] * 60000);
      }
    }

    if (args[2]) {
      if (
        parseInt(args[2]) < 1 ||
        parseInt(args[2] > 120) ||
        isNaN(parseInt(args[1]))
      ) {
        message.channel.send('Insert a valid time between 1 and 120 minutes!');
        return false;
      } else {
        pomodoreStatus.minutes[1] = parseInt(args[2] * 60000);
      }
    }

    if (args[3]) {
      if (
        parseInt(args[3]) < 1 ||
        parseInt(args[3] > 120) ||
        isNaN(parseInt(args[1]))
      ) {
        message.channel.send('Insert a valid time between 1 and 120 minutes!');
        return false;
      } else {
        pomodoreStatus.minutes[2] = parseInt(args[3] * 60000);
      }
    }

    if (message.member.voice.channel) {
      //Change status to active
      pomodoreStatus.status = true;
      pomodoreStatus.time = 1;

      //Join a channel
      connection = await message.member.voice.channel.join();

      //Start cycle function
      const startANewCycle = () => {
        if (pomodoreStatus.time % 2 != 0 && pomodoreStatus.status) {
          //Work interval
          timerStartedTime = new Date();

          client.user.setActivity('Working time');

          dispatcher = connection.play('./sounds/time-over.ogg', {
            volume: pomodoreStatus.volume,
          });

          dispatcher.on('finish', () => {
            dispatcher = connection.play('./sounds/silence-fixer.ogg');
          });

          setTimeout(() => {
            pomodoreStatus.time++;

            if (pomodoreStatus.status && pomodoreStatus.textAlerts) {
              message.channel.send(
                `You worked for ${
                  pomodoreStatus.minutes[0] / 60000
                }min! Time for a small break of ${
                  pomodoreStatus.minutes[1] / 60000
                }min!`
              );
            }

            if (pomodoreStatus.peopleToDm.length > 0) {
              pomodoreStatus.peopleToDm.forEach((person) => {
                client.users.cache
                  .get(person)
                  .send(
                    `You worked for ${
                      pomodoreStatus.minutes[0] / 60000
                    }min! Time for a small break of ${
                      pomodoreStatus.minutes[1] / 60000
                    }min!`
                  );
              });
            }

            startANewCycle();
          }, pomodoreStatus.minutes[0]);
        } else if (
          pomodoreStatus.time % 2 == 0 &&
          pomodoreStatus.time != 8 &&
          pomodoreStatus.status
        ) {
          //Small pause
          timerStartedTime = new Date();

          dispatcher = connection.play('./sounds/time-over.ogg', {
            volume: pomodoreStatus.volume,
          });

          dispatcher.on('finish', () => {
            dispatcher = connection.play('./sounds/silence-fixer.ogg');
          });

          client.user.setActivity('Break time');

          setTimeout(() => {
            pomodoreStatus.time++;

            if (pomodoreStatus.status && pomodoreStatus.textAlerts) {
              message.channel.send(
                `You finished your ${
                  pomodoreStatus.minutes[1] / 60000
                }min break! Let's get back to work again!`
              );
            }

            if (pomodoreStatus.peopleToDm.length > 0) {
              pomodoreStatus.peopleToDm.forEach((person) => {
                client.users.cache
                  .get(person)
                  .send(
                    `You finished your ${
                      pomodoreStatus.minutes[1] / 60000
                    }min break! Let's get back to work again!`
                  );
              });
            }

            startANewCycle();
          }, pomodoreStatus.minutes[1]);
        } else if (pomodoreStatus.time == 8 && pomodoreStatus.status) {
          //Big pause
          timerStartedTime = new Date();

          dispatcher = connection.play('./sounds/time-over.ogg', {
            volume: pomodoreStatus.volume,
          });

          dispatcher.on('finish', () => {
            dispatcher = connection.play('./sounds/silence-fixer.ogg');
          });

          client.user.setActivity('Break time');

          setTimeout(() => {
            pomodoreStatus = 1;

            if (pomodoreStatus.status && pomodoreStatus.textAlerts) {
              message.channel.send(
                `You finished your ${
                  pomodoreStatus.minutes[2] / 60000
                }min break! Let's get back to work again!`
              );
            }

            //Send DM's
            if (pomodoreStatus.peopleToDm.length > 0) {
              pomodoreStatus.peopleToDm.forEach((person) => {
                client.users.cache
                  .get(person)
                  .send(
                    `You finished your ${
                      pomodoreStatus.minutes[2] / 60000
                    }min break! Let's get back to work again!`
                  );
              });
            }

            startANewCycle();
          }, pomodoreStatus.minutes[2]);
        } else {
          client.user.setActivity('Type p!help');
          return;
        }
      };

      //Start the timer for the first time
      message.channel.send("Pomodoro started! Let's get to work!");

      //Function that checks time minute by minute and changes the status of the bot
      checkTime = setInterval(() => {
        let now = new Date();
        let timePassed = now.getTime() - timerStartedTime.getTime();
        let timeLeft;

        if (pomodoreStatus.time % 2 != 0) {
          timeLeft = parseInt((pomodoreStatus.minutes[0] - timePassed) / 60000);
          if (timeLeft < 10 && pomodoreStatus.timeShow) {
            client.user.setActivity(`${timeLeft + 1}min left`);
            pomodoreStatus.timeShow = false;
          } else {
            client.user.setActivity(`Working Time`);
            pomodoreStatus.timeShow = true;
          }
        } else if (pomodoreStatus.time % 2 == 0 && pomodoreStatus.time != 8) {
          timeLeft = parseInt((pomodoreStatus.minutes[1] - timePassed) / 60000);
          if (timeLeft < 10 && pomodoreStatus.timeShow) {
            client.user.setActivity(`${timeLeft + 1}min left`);
            pomodoreStatus.timeShow = false;
          } else {
            client.user.setActivity(`Break Time`);
            pomodoreStatus.timeShow = true;
          }
        } else {
          timeLeft = parseInt((pomodoreStatus.minutes[2] - timePassed) / 60000);
          if (timeLeft < 10 && pomodoreStatus.timeShow) {
            client.user.setActivity(`${timeLeft + 1}min left`);
            pomodoreStatus.timeShow = false;
          } else {
            client.user.setActivity(`Break Time`);
            pomodoreStatus.timeShow = true;
          }
        }
      }, 30000);

      startANewCycle();
    } else {
      //If the dude who called the command is not in a voice channel
      message.reply('You need to join a voice channel first!');
    }
  }

  //Remove bot from voice channel
  if (message.content === 'p!stop') {
    client.user.setActivity('Type p!help');

    message.channel.send('Nice work! Glad I could help!');
    message.member.voice.channel.leave();

    pomodoreStatus.status = false;
    pomodoreStatus.time = 0;
    pomodoreStatus.onPomodoroChannel = false;
    pomodoreStatus.pomodoroChannelName = 'pomodoro';
    pomodoreStatus.peopleToDm = [];
    pomodoreStatus.firstTime = true;
    pomodoreStatus.textAlerts = true;
    pomodoreStatus.timeShow = true;
    pomodoreStatus.volume = 0.5;

    connection = null;
    dispatcher = null;
    clearInterval(checkTime);
  }

  //Status command
  if (message.content === 'p!status') {
    if (pomodoreStatus.status) {
      let now = new Date();
      let timePassed = now.getTime() - timerStartedTime.getTime();
      let timeLeft;

      if (pomodoreStatus.time % 2 != 0) {
        timeLeft = parseInt((pomodoreStatus.minutes[0] - timePassed) / 60000);
        message.channel.send(
          `${timeLeft + 1}min left to your break! Keep it up!`
        );
      } else if (pomodoreStatus.time % 2 == 0 && pomodoreStatus.time != 8) {
        timeLeft = parseInt((pomodoreStatus.minutes[1] - timePassed) / 60000);
        message.channel.send(`${timeLeft + 1}min left to start working!`);
      } else {
        timeLeft = parseInt((pomodoreStatus.minutes[2] - timePassed) / 60000);
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
        { name: 'Check the current status of the pomodoro', value: 'p!status' },
        { name: 'Toggle the notifications via direct message', value: 'p!dm' },
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
    if (pomodoreStatus.peopleToDm.includes(message.author.id)) {
      pomodoreStatus.peopleToDm = pomodoreStatus.peopleToDm.filter(
        (item) => item !== message.author.id
      );
      message.reply('you will stop receiving the alerts via Direct Message!');
    } else {
      pomodoreStatus.peopleToDm.push(message.author.id);
      message.reply('you will now receive the alerts via Direct Message!');
    }

    console.log(pomodoreStatus.peopleToDm);
  }

  //Toggle text notifications
  if (message.content === 'p!togtext') {
    pomodoreStatus.textAlerts = !pomodoreStatus.textAlerts;

    if (pomodoreStatus.textAlerts) {
      message.channel.send('The text notifications have been turned on!');
    } else {
      message.channel.send('The text notifications have been turned off!');
    }
  }

  if (args[0] === 'p!volume') {
    if (pomodoreStatus.status) {
      if (args[1]) {
        if (
          parseInt(args[1]) < 1 ||
          parseInt(args[1] > 100 || isNaN(parseInt(args[1])))
        ) {
          message.channel.send(
            'Please insert a valid number between 0 and 100'
          );
        } else {
          pomodoreStatus.volume = args[1] / 100;
          message.channel.send(`The volume has been set to ${args[1]}`);
        }
      } else {
        message.channel.send(
          'Please type a second argument with a number between 0 and 100'
        );
      }
    } else {
      message.channel.send("There's no pomodoro running!");
    }
  }
});

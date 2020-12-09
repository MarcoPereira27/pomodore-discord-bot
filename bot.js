const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.DJS_TOKEN);

client.on('ready', () => {
  console.log('❤');
  client.user.setActivity('Type p!help');
});

client.user.setActivity('Down for maintenance');

class Pomodoro {
  constructor(workTime, smallBreak, bigBreak, connection, id, message) {
    this.id = id;
    this.workTime = workTime;
    this.smallBreak = smallBreak;
    this.bigBreak = bigBreak;
    this.peopleToDm = [];
    this.textAlerts = true;
    this.volume = 0.5;
    this.connection = connection;
    this.message = message;
    this.time = 1;
    this.timerStartedTime = new Date();
    this.dispatcher = null;
    this.timer = null;
    this.alertText = '';
    this.interval = null;

    this.startANewCycle();
  }

  startANewCycle() {
    console.log(this.message.member.voice.channel);

    if (this.time % 2 != 0 && this.time != 7) {
      this.interval = this.workTime;
      this.alertText = `You worked for ${
        this.workTime / 60000
      }min! Time for a small break of ${this.smallBreak / 60000}min!`;
    } else if (this.time == 7) {
      this.interval = this.workTime;
      this.alertText = `You worked for ${
        this.workTime / 60000
      }min! Time for a big break of ${this.bigBreak / 60000}min!`;
    } else if (this.time % 2 == 0 && this.time != 8) {
      this.interval = this.smallBreak;
      this.alertText = `You finished your ${
        this.smallBreak / 60000
      }min break! Let's get back to work!`;
    } else if (this.time == 8) {
      this.interval = this.bigBreak;
      this.alertText = `You finished your ${
        this.bigBreak / 60000
      }min break! Ket's get back to work!`;
    }

    this.timerStartedTime = new Date();

    this.dispatcher = this.connection.play('./sounds/time-over.ogg', {
      volume: this.volume,
    });

    this.dispatcher.on('finish', () => {
      this.dispatcher = this.connection.play('./sounds/silence-fixer.ogg');
    });

    this.timer = setTimeout(() => {
      this.time++;

      //Send Text Alerts
      if (this.textAlerts) {
        this.message.channel.send(this.alertText);
      }

      //Send DM Alerts
      if (this.peopleToDm.length > 0) {
        this.peopleToDm.forEach((person) => {
          client.users.cache.get(person).send(this.alertText);
        });
      }

      //Start a New Cycle
      this.startANewCycle();
    }, this.interval);
  }

  stopTimer() {
    clearTimeout(this.timer);
  }

  addToDM(id, message) {
    if (this.peopleToDm.filter((person) => person == id).length == 0) {
      this.peopleToDm.push(id);
      message.reply('you will now receive the alerts via Direct Message!');
    } else {
      this.peopleToDm = this.peopleToDm.filter((person) => person != id);
      message.reply('you will stop receiving the alerts via Direct Message!');
    }
  }

  toggleNotifications(message) {
    this.textAlerts = !this.textAlerts;

    if (this.textAlerts) {
      message.channel.send('The text notifications have been turned on!');
    } else {
      message.channel.send('The text notifications have been turned off!');
    }
  }

  changeVolume(volume) {
    this.volume = volume;
  }
}

class Container {
  constructor() {
    this.pomodoros = [];
  }

  addPomodoro(pomodoro) {
    this.pomodoros.push(pomodoro);
  }

  removePomodoro(id) {
    this.pomodoros = this.pomodoros.filter((pomodoro) => pomodoro.id != id);
  }
}

let container = new Container();

setInterval(() => {
  container.pomodoros.forEach((pomodoro) => {
    console.log(`${pomodoro.id}: ${pomodoro.time}`);
  });
  console.log('#############################');
}, 600000);

client.on('message', async (message) => {
  if (!message.guild) return;

  const args = message.content.trim().split(' ');

  if (args[0] === 'p!start') {
    //Check arguments
    if (args[1]) {
      if (
        parseInt(args[1]) < 5 ||
        parseInt(args[1]) > 120 ||
        isNaN(parseInt(args[1]))
      ) {
        message.channel.send('Insert a valid time between 5 and 120 minutes!');
        return;
      }
    }

    if (args[2]) {
      if (
        parseInt(args[2]) < 5 ||
        parseInt(args[2]) > 120 ||
        isNaN(parseInt(args[2]))
      ) {
        message.channel.send('Insert a valid time between 5 and 120 minutes!');
        return;
      }
    }

    if (args[3]) {
      if (
        parseInt(args[3]) < 5 ||
        parseInt(args[3]) > 120 ||
        isNaN(parseInt(args[3]))
      ) {
        message.channel.send('Insert a valid time between 5 and 120 minutes!');
        return;
      }
    }

    //Add Pomodoro with values or default
    if (message.member.voice.channel) {
      let pomodoro = container.pomodoros.filter(
        (pomodoro) => pomodoro.id == message.guild.id
      );

      if (pomodoro.length > 0) {
        message.reply("There's already a pomodoro running!");
        return;
      }

      try {
        if (args[1] && args[2] && args[3]) {
          container.addPomodoro(
            new Pomodoro(
              parseInt(args[1] * 60000),
              parseInt(args[2] * 60000),
              parseInt(args[3] * 60000),
              await message.member.voice.channel.join(),
              message.guild.id,
              message
            )
          );
        } else {
          container.addPomodoro(
            new Pomodoro(
              1500000,
              300000,
              900000,
              await message.member.voice.channel.join(),
              message.guild.id,
              message
            )
          );
        }
      } catch (err) {
        console.log(err);
        message.channel.send(
          "I'm struggling to join your voice channel! Please check my permissions!"
        );
        return;
      }
    } else {
      message.channel.send(
        'You have to be in a voice channel to start a pomodoro!'
      );
      return;
    }
    message.channel.send("Pomodoro started! Let's get to work!");
  }

  //Stop the pomodoro
  if (args[0] == 'p!stop') {
    if (!message.member.voice.channel) {
      message.reply('You are not in a voice channel!');
      return;
    }

    let pomodoroStop = container.pomodoros.filter(
      (pomodoro) => pomodoro.id == message.guild.id
    );

    if (pomodoroStop.length == 0) {
      message.reply("There's no pomodoro currently running!");
      return;
    }

    pomodoroStop[0].stopTimer();
    container.removePomodoro(message.guild.id);

    message.channel.send('Nice work! Glad I could help!');
    message.member.voice.channel.leave();

    console.log(container.pomodoros);
  }

  if (args[0] == 'p!status') {
    let pomodoro = container.pomodoros.filter(
      (pomodoro) => pomodoro.id == message.guild.id
    );

    if (pomodoro.length == 0) {
      message.reply("There's no pomodoro currently running!");
      return;
    }

    let now = new Date();
    let timePassed = now.getTime() - pomodoro[0].timerStartedTime.getTime();
    let timeLeft;

    if (pomodoro[0].time % 2 != 0) {
      timeLeft = parseInt((pomodoro[0].workTime - timePassed) / 60000);
      message.channel.send(
        `${timeLeft + 1}min left to your break! Keep it up!`
      );
    } else if (pomodoro[0].time % 2 == 0 && pomodoro[0].time != 8) {
      timeLeft = parseInt((pomodoro[0].smallBreak - timePassed) / 60000);
      message.channel.send(`${timeLeft + 1}min left to start working!`);
    } else {
      timeLeft = parseInt((pomodoro[0].bigBreak - timePassed) / 60000);
      message.channel.send(`${timeLeft + 1}min left to start working!`);
    }
  }

  if (args[0] == 'p!help') {
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

  if (args[0] == 'p!dm') {
    if (!message.member.voice.channel) {
      message.reply('You are not in a voice channel!');
      return;
    }

    let pomodoro = container.pomodoros.filter(
      (pomodoro) => pomodoro.id == message.guild.id
    );

    if (pomodoro.length == 0) {
      message.reply("There's no pomodoro currently running!");
      return;
    }

    pomodoro[0].addToDM(message.author.id, message);
  }

  if (args[0] == 'p!togtext') {
    if (!message.member.voice.channel) {
      message.reply('You are not in a voice channel!');
      return;
    }

    let pomodoro = container.pomodoros.filter(
      (pomodoro) => pomodoro.id == message.guild.id
    );

    if (pomodoro.length == 0) {
      message.reply("There's no pomodoro currently running!");
      return;
    }

    pomodoro[0].toggleNotifications(message);
  }

  if (args[0] == 'p!volume') {
    if (!message.member.voice.channel) {
      message.reply('You are not in a voice channel!');
      return;
    }

    let pomodoro = container.pomodoros.filter(
      (pomodoro) => pomodoro.id == message.guild.id
    );

    if (pomodoro.length == 0) {
      message.reply("There's no pomodoro currently running!");
      return;
    }

    if (args[1]) {
      if (
        parseInt(args[1]) < 1 ||
        parseInt(args[1] > 100 || isNaN(parseInt(args[1])))
      ) {
        message.channel.send('Please insert a valid number between 0 and 100');
      } else {
        pomodoro[0].changeVolume(args[1] / 100);
        message.channel.send(`The volume has been set to ${args[1]}`);
      }
    } else {
      message.channel.send(
        'Please type a second argument with a number between 0 and 100'
      );
    }
  }
});

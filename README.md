# Pomodore

Pomodore is a discord bot that implements a pomodoro timer on your server.
It enables:

- Group pomodoros
- Voice and Text alarms
- Customizable timers

### Bot commands

| Command                                                    | Description                                           |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| pd!start                                                   | Start a pomodoro timer with default values            |
| pd!tostart                                                 | Start a text-only pomodoro timer with default values  |
| pd!start [work time] [small break time] [big break time]   | Start the pomodoro with specific values               |
| pd!tostart [work time] [small break time] [big break time] | Start a text-only pomodoro timer with specific values |
| pd!stop                                                    | Stop the pomodoro timer                               |
| pd!status                                                  | Check the current status of the pomodoro              |
| pd!dm                                                      | Toggle the notifications via direct message           |
| pd!togtext                                                 | Toggle the channel text notifications                 |
| pd!volume volume                                           | Change the volume of the alerts, defaults to 50       |
| pd!help                                                    | Get the list of commands                              |
| pd!clear                                                   | Deletes the last 30 messages related to the bot       |

### Self-Hosting

To self-host this bot follow these steps:

- Create an application in the Discord Developer Portal.
- Create a bot.
- Clone this repository.
- Copy your bot's token.
- Paste your bot's token in the .env file.
- Run `npm install`
- Invite your bot to your server
- Run `node bot.js`

### Roadmap

- [ ] Add Task Management
- [ ] Multiple Pomodoros in one server
- [ ] Save personal pomodoro data

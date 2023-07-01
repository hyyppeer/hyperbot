import { config } from '..';
import { Bot } from '../bot/bot';
import { Module, defineCommand, defineModule } from './modules';

let duck = false;
let lastDuckBefriended = false;

function addDuck(bot: Bot) {
  bot.client.client.say(config.ducks.channel, 'QUACK!! (-bef to befriend)');
  duck = true;
  lastDuckBefriended = false;
  setTimeout(() => {
    if (lastDuckBefriended || !duck) return;
    bot.client.client.say(config.ducks.channel, 'quack :( the duck has left!');
    duck = false;
    lastDuckBefriended = false;
  }, 5 * 60 * 1000);
}

export const ducks: Module = defineModule(
  'ducks',
  [
    defineCommand('bef', '', 'befriend the current duck in the channel (if there is one)', async (cmd) => {
      if (duck) {
        duck = false;
        lastDuckBefriended = true;
        const data = await cmd.data();
        if (!data.ducks) {
          cmd.setData('ducks', 0);
        }
        cmd.setData('ducks', data.ducks + 1);
        cmd.respond(`You befriended the duck, you have befriended ${data.ducks + 1} in ${config.ducks.channel}!`);
      } else throw 'There is no duck!';
    }),
    defineCommand('ducks', '', 'tells you how many ducks you have', async (cmd) => {
      cmd.respond(`You have ${(await cmd.data()).ducks || 0} ducks in ${config.ducks.channel}!`);
    }),
    // defineCommand(
    //   'add',
    //   '',
    //   'add a duck for testing',
    //   (cmd) => {
    //     addDuck(cmd.bot);
    //   },
    //   Rank.Owner
    // ),
  ],
  (bot) => {
    setInterval(() => addDuck(bot), 15 * 60 * 1000);
  }
);

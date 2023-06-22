import { config, duckStore } from '..';
import { Bot, Rank } from '../bot/bot';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';

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
      await cmd.identify();
      if (!cmd.user) throw CommandErrorId.InternalFailure;

      if (duck) {
        duck = false;
        lastDuckBefriended = true;
        let val = duckStore.get(cmd.user);
        if (!val) {
          duckStore.set(cmd.user, '0');
          val = '0';
        }
        const ducks = Number.parseInt(val);
        if (Number.isNaN(ducks)) throw CommandErrorId.InternalFailure;
        duckStore.set(cmd.user, (ducks + 1).toString());
        cmd.respond(`You befriended the duck, you have befriended ${ducks + 1} in ${config.ducks.channel}!`);
      } else throw 'There is no duck!';
    }),
    defineCommand('ducks', '', 'tells you how many ducks you have', async (cmd) => {
      await cmd.identify();
      if (!cmd.user) throw CommandErrorId.InternalFailure;

      let val = duckStore.get(cmd.user);
      if (!val) {
        duckStore.set(cmd.user, '0');
        val = '0';
      }
      const ducks = Number.parseInt(val);
      cmd.respond(`You have ${ducks} ducks in ${config.ducks.channel}!`);
    }),
    // defineCommand(
    //   'add',
    //   '',
    //   'add a duck for testing',
    //   (cmd) => {
    //     addDuck(cmd.bot);
    //   },
    //   (cmd) => cmd.op >= Rank.Owner
    // ),
  ],
  (bot) => {
    setInterval(() => addDuck(bot), 15 * 60 * 1000);
  }
);

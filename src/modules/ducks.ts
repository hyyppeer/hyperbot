import { config, duckStore } from '..';
import { Bot, Rank } from '../bot/bot';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';

let duck = false;

function addDuck(bot: Bot) {
  bot.client.client.say(config.ducks.channel, 'QUACK!! (-bef to befriend)');
  duck = true;
}

export const ducks: Module = defineModule(
  'ducks',
  {
    bef: defineCommand('bef', '', 'befriend the current duck in the channel (if there is one)', async (cmd) => {
      await cmd.identify();
      if (!cmd.user) throw CommandErrorId.InternalFailure;

      if (duck) {
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
    ducks: defineCommand('ducks', '', 'tells you how many ducks you have', async (cmd) => {
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
  },
  (bot) => {
    setInterval(() => addDuck(bot), 15 * 60 * 1000);
  }
);

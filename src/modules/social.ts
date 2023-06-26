import { LastSeen } from '../bot/services/lastseen';
import { CommandErrorId, defineCommand, defineModule, Module } from './modules';

export const social: Module = defineModule(
  'social',
  [
    defineCommand('lastseen', '<nick>', 'Tells you the last time i saw a nick', (cmd) => {
      if (!cmd.args[0]) throw CommandErrorId.NotEnoughArguments;

      const info = LastSeen.when(cmd.args[0]);
      if (!info.message) throw "I've never seen them before.";

      const date = new Date();
      date.setUTCMilliseconds(info.time);

      cmd.respond(`${date.getUTCDate()}/${date.getUTCMonth()}/${date.getUTCFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}, <${cmd.args[0]}>: ${info.message}`);
    }),
  ],
  (bot) => {
    bot.clients.forEach((client) => client.client.on('message', (nick, to, text) => LastSeen.seen(nick, text)));
  }
);

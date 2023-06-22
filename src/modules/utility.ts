import { Shell } from '../bot/services/town/shell';
import { Rank } from '../bot/bot';
import { defineCommand, defineModule, Module, CommandErrorId } from './modules';
import { noPingStore } from '..';
import { Extension } from '../util/ext';

const hyperbole: Record<string, string> = {
  say: 'communicate',
  ban: 'banish',
  talk: 'communicate',
  kill: 'exterminate',
  end: 'terminate',
  see: 'observe',
  get: 'acquire',
  big: 'enormous',
  heavy: 'massive',
  light: 'weightless',
  small: 'quantum',
  ball: 'spherical object',
  learn: 'acquire information pertaining to',
  want: 'wish',
  use: 'leverage',
};

export const utility: Module = defineModule('utility', [
  defineCommand(
    'sh',
    '<command>',
    'run a shell command',
    async (cmd) => {
      const [out, code] = await Shell.exec(cmd.arg);
      const escaped = out.trim().split('\n').join('\\n');
      cmd.respond(`Code ${code}: ${escaped}`);
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  defineCommand(
    'eval',
    '<javascript>',
    'evaluate javascript code',
    (cmd) => {
      eval(cmd.arg);
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  defineCommand('noping', '[<true/false/yes/y/no/n/t/f>]', 'toggles/sets whether or not to ping you when responding', (cmd) => {
    const list: Array<string> = JSON.parse(noPingStore.get('pings') || '[]');
    const pinged = !list.includes(cmd.runner);

    if (cmd.args[0]) {
      const yeswords = ['yes', 'y', 'true', 't'];

      if (yeswords.includes(cmd.args[0].toLowerCase())) {
        if (!list.includes(cmd.runner)) list.push(cmd.runner);
        else {
          throw 'You are already in the no ping list';
        }
      } else {
        if (list.includes(cmd.runner)) list.splice(list.indexOf(cmd.runner), 1);
        else {
          throw 'You are already not in the no ping list';
        }
      }
    } else {
      pinged ? list.push(cmd.runner) : list.splice(list.indexOf(cmd.runner), 1);
    }

    noPingStore.set('pings', JSON.stringify(list));
    cmd.respond('success');
  }),
  defineCommand('uptime', '', 'shows how much the bot has been running', (cmd) => {
    cmd.respond(`${Math.floor(process.uptime())}s`);
  }),
  defineCommand(
    'runext',
    '<source>',
    'runs an extension from its source',
    (cmd) => {
      if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

      Extension.execute(cmd.arg, cmd.bot, cmd);
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  defineCommand('hyperbole', '<sentence>', 'replaces every word in a sentence with an exaggerated version', (cmd) => {
    cmd.respond(
      cmd.arg
        .split(' ')
        .map((v) => hyperbole[v] || v)
        .join(' ')
    );
  }),
]);

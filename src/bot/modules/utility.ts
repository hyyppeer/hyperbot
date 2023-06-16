import { Shell } from '../services/town/shell';
import { Rank } from '../bot';
import { commands, defineCommand, defineModule, Module, CmdApi } from './modules';

const topics: Record<string, string | ((cmd: CmdApi) => string)> = {
  'getting-started': 'use help to get a list of commands then help <command> to get info about a specific command, good luck on your journey!',
};

export const utility: Module = defineModule('utility', {
  help: defineCommand('help', 'help [<command>]', 'get help about a specific command/topic or list all commands and topics', (cmd) => {
    if (cmd.args[0]) {
      if (commands[cmd.args[0]]) {
        const info = commands[cmd.args[0]];
        cmd.respond(`syntax: ${info.syntax}, help: ${info.help(cmd)}`);
      } else if (topics[cmd.args[0]]) {
        const topic = topics[cmd.args[0]];
        cmd.respond(`info about ${cmd.args[0]}: ${typeof topic === 'string' ? topic : topic(cmd)}`);
      } else {
        cmd.respond('No such command exists');
      }
    } else {
      cmd.respond(`Commands: ${Object.keys(commands).join(' ')} | Topics: ${Object.keys(topics).join(' ')}`);
    }
  }),
  sh: defineCommand(
    'sh',
    'sh <command>',
    'run a shell command',
    async (cmd) => {
      const [out, code] = await Shell.exec(cmd.arg);
      const escaped = out.trim().split('\n').join('\\n');
      cmd.respond(`Code ${code}: ${escaped}`);
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  eval: defineCommand(
    'eval',
    'eval <javascript>',
    'evaluate javascript code',
    (cmd) => {
      eval(cmd.arg);
    },
    (cmd) => cmd.op === Rank.Owner
  ),
});

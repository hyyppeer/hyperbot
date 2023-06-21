import { Shell } from '../services/town/shell';
import { Rank } from '../bot';
import { commands, defineCommand, defineModule, Module, CmdApi, modules, CommandErrorId } from './modules';
import { noPingStore } from '../..';
import axios from 'axios';
import { Logger } from '../../util/logger';
import { replaceAll } from '../../util/polyfills';
import { Extension } from '../../util/ext';

const topics: Record<string, string | ((cmd: CmdApi) => string)> = {
  'getting-started': 'use help to get a list of commands then help <command> to get info about a specific command, good luck on your journey!',
  commands: () => {
    const list = Object.keys(commands);

    return `here is a list of all commands: ${list.join(' ')}`;
  },
};

function help(name: string, cmd: CmdApi) {
  if (modules[name]) {
    return `module ${name}: help: ${modules[name].help}, commands: ${Object.keys(modules[name].contents).join(' ')}`;
  } else if (commands[name]) {
    return `command ${name}: syntax: ${commands[name].syntax}, help: ${commands[name].help(cmd)}`;
  } else if (topics[name]) {
    const topic = topics[name];
    return `topic ${name}: ${typeof topic === 'string' ? topic : topic(cmd)}`;
  } else {
    return `${name} doesn't exist :(`;
  }
}

export const utility: Module = defineModule('utility', 'commands for other purposes', {
  help: defineCommand('help', 'help [<command>]', 'get help about a specific command/topic or list all commands and topics', (cmd) => {
    if (cmd.arg) {
      cmd.respond(help(cmd.arg, cmd));
    } else {
      cmd.respond(`Modules: ${Object.keys(modules).join(' ')} | Topics: ${Object.keys(topics).join(' ')}`);
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
  noping: defineCommand('noping', 'noping [<true/false/yes/y/no/n/t/f>]', 'toggles/sets whether or not to ping you when responding', (cmd) => {
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
  rustexec: defineCommand('rustexec', 'rustexec <channel (stable/beta/nightly)> <mode (debug/release)> <code>', 'executes a rust program using play.rust-lang.org/execute', (cmd) => {
    if (cmd.args.length < 3) throw CommandErrorId.NotEnoughArguments;
    const params = {
      backtrace: false,
      channel: cmd.args[0],
      code: replaceAll(replaceAll(cmd.args.slice(2).join(' '), '\\n', '\n'), '\\t', '\t'),
      crateType: 'bin',
      edition: '2021',
      mode: cmd.args[1],
      tests: false,
    };

    axios
      .post(`https://play.rust-lang.org/execute`, JSON.stringify(params), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        cmd.respond(response.data.success ? 'Success' : 'Failure', true);
        if (response.data.stdout) cmd.respond('--- STDOUT ---', true);
        if (response.data.stdout)
          cmd.respond(
            response.data.stdout
              .split('\n')
              .slice(0, 5)
              .map((v: string) => `> ${v}`)
              .join('\n'),
            true
          );
        if (response.data.stderr) cmd.respond('--- STDERR ---', true);
        if (response.data.stderr)
          cmd.respond(
            response.data.stderr
              .split('\n')
              .slice(0, 5)
              .map((v: string) => `> ${v}`)
              .join('\n'),
            true
          );
      })
      .catch((reason) => {
        Logger.error('rust', reason);
      });
  }),
  uptime: defineCommand('uptime', 'uptime', 'shows how much the bot has been running', (cmd) => {
    cmd.respond(`${Math.floor(process.uptime())}s`);
  }),
  runext: defineCommand(
    'runext',
    'runext <source>',
    'runs an extension from its source',
    (cmd) => {
      if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

      Extension.execute(cmd.arg, cmd.bot);
    },
    (cmd) => cmd.op === Rank.Owner
  ),
});

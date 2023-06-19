import { Shell } from '../services/town/shell';
import { Rank } from '../bot';
import { commands, defineCommand, defineModule, Module, CmdApi, modules } from './modules';
import { config, noPingStore } from '../..';
import axios from 'axios';
import { Logger } from '../../util/logger';
import { replaceAll } from '../../util/polyfills';
import { JsonCmdAction, JsonCmdActionType, JsonCmdListener, JsonCommand, JsonCommands, JsonPackage } from '../../util/jsoncmds';
import { readFileSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';

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
    if (cmd.args[0]) {
      cmd.respond(help(cmd.args[0], cmd));
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
          throw 'you are already in the no ping list';
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
    if (cmd.args.length < 3) throw 'Not enough arguments provided';
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
  loadpkg: defineCommand(
    'loadpkg',
    'loadpkg <pkg-name>',
    'load a package from json-pkgs',
    (cmd) => {
      if (!cmd.args[0]) throw 'must provide a package path';
      JsonCommands.loadPackage(readFileSync(`${config.jsonpkg.rootdir}/${cmd.args[0]}`).toString('utf8'));
    },
    (cmd) => cmd.op >= Rank.Owner
  ),
  createpkg: defineCommand(
    'createpkg',
    'createpkg',
    'create a package, you will be asked to enter info about it',
    async (cmd) => {
      cmd.respond('Please note: only ASCII characters are allowed in these fields');
      const name = await cmd.ask('What would you like to name your package?');
      const help = await cmd.ask('Please enter a help string for your package.');
      let commands: JsonCommand[] = [];

      while (true) {
        if (!(await cmd.confirm('Would you like to add a command? (y/N)'))) {
          break;
        }

        const name = await cmd.ask('What would you like to name this command?');
        const syntax = await cmd.ask('What is the syntax to use this command?');
        const help = await cmd.ask('What is the help for this command?');
        const rank = Number.parseInt(await cmd.ask('What is the minimum rank to use this command? (1-3)'));
        const listeners: JsonCmdListener[] = [];
        while (true) {
          if (!(await cmd.confirm('Would you like to add a listener? (y/N)'))) {
            break;
          }

          const onans = await cmd.ask('When would you like this command to be triggered? (ran)');
          const on = onans === 'ran' ? onans : 'ran';

          const actions: JsonCmdAction[] = [];
          while (true) {
            if (!(await cmd.confirm('Would you like to add an action? (y/N)'))) {
              break;
            }

            const typea = await cmd.ask('What is the type of this action? (say/do)');
            const type: JsonCmdActionType = typea === 'do' ? typea : 'say';

            const argarr: string[] = [];
            while (true) {
              if (!(await cmd.confirm('Would you like to add an argument? (y/N)'))) {
                break;
              }

              const arg = await cmd.ask('Please enter the argument.');
              argarr.push(arg);
            }
            actions.push({
              type,
              args: argarr,
            });
          }
          listeners.push({
            on,
            actions,
          });
        }
        commands.push({
          help,
          listeners,
          syntax,
          name,
          rankRequired: rank,
        });
      }

      const pkg: JsonPackage = {
        name,
        help,
        commands,
      };

      const pkgstr = JsonCommands.createPackage(pkg);
      const json = JsonCommands.decompress(pkgstr);

      cmd.respond(`Here is your package string: ${pkgstr}`);
      cmd.respond('Load it using the loadpkgstr command');
      const submit = await cmd.confirm('Would you like to submit this package to be reviewed and potentially added to the bot?');

      if (submit) {
        const pkgid = randomBytes(8).toString('hex');
        writeFileSync(`${config.jsonpkg.submissionrootdir}/submit-${pkgid}.pkg`, pkgstr);
        writeFileSync(`${config.jsonpkg.submissionrootdir}/submit-${pkgid}.json`, json);
        cmd.respond('Submitted!');
        Logger.info('package', `Submitted package ${pkgid} for review in ${config.jsonpkg.submissionrootdir}`);
      } else cmd.respond('Your package has not been submitted');
    },
    (cmd) => cmd.op >= Rank.Owner
  ),
  loadpkgstr: defineCommand(
    'loadpkgstr',
    'loadpkgstr <pkgstr>',
    'loads a package from its pkgstr',
    (cmd) => {
      if (!cmd.arg) throw 'No string provided';

      JsonCommands.loadPackage(cmd.arg);
    },
    (cmd) => cmd.op >= Rank.Owner
  ),
});

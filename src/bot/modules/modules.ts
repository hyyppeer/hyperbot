import { Bot, Rank } from '../bot';
import { bundle, config, noPingStore } from '../../index';
import { Logger } from '../../util/logger';
import chalk from 'chalk';

export interface CmdApi {
  respond(text: string, pm?: boolean): void;
  runner: string;
  args: Array<string>;
  arg: string;
  todo(): void;
  op: Rank;
  bot: Bot;
  channel: string;
}

interface Command {
  name: string;
  run: (cmd: CmdApi) => void;
  authenticate: (cmd: CmdApi) => boolean;
  syntax: string;
  help: (cmd: CmdApi) => string;
}

interface ModuleContents {
  [name: string]: Command;
}

export interface Module {
  name: string;
  contents: ModuleContents;
}

export function defineModule(name: string, contents: ModuleContents): Module {
  return {
    name,
    contents,
  };
}

export function defineCommand(name: string, syntax: string, help: ((cmd: CmdApi) => string) | string, handler: (cmd: CmdApi) => void, authenticator?: (cmd: CmdApi) => boolean): Command {
  return {
    name,
    run: handler,
    authenticate: authenticator || (() => true),
    syntax,
    help: typeof help === 'string' ? () => help : help,
  };
}

function rollcall(cmd: CmdApi) {
  cmd.respond(bundle['rollcall.response'](config.branding.name, config.branding.owner));
}

export const commands: Record<string, Command> = {};

function loadModule(mod: Module) {
  Logger.debug('modules', `Loading module: ${chalk.greenBright(mod.name)}`);
  for (const [key, value] of Object.entries(mod.contents)) {
    commands[key] = value;
  }
}

function call(cmd: CmdApi, command: string) {
  const commandobj = commands[command.toLowerCase()];

  if (!commandobj) {
    return;
  }

  if (commandobj.authenticate(cmd)) {
    try {
      commandobj.run(cmd);
    } catch (e) {
      cmd.respond('fail: ' + e);
    }
  } else {
    cmd.respond(`Not permitted to run ${command.toLowerCase()}`);
  }
}

let ownernick = '';

function nickauth(nick: string, bot: Bot) {
  if (nick === config.auth.ownernick && ownernick !== nick) {
    bot.client.client.whois(nick, (info) => {
      if (info.user === config.auth.ownernick) {
        ownernick = nick;
        Logger.info('mod', `Automatically OP'ed ${nick} to owner (ownernick is ${config.auth.ownernick})`);
      } else Logger.debug('e', '2');
    });
  }
}

function createApi(nick: string, to: string, text: string, bot: Bot, prefix: string, op: Rank): CmdApi {
  let responseLocation = bot.client.client.nick === to ? nick : to;
  return {
    respond(text, pm) {
      let message = text;
      if (!JSON.parse(noPingStore.get('pings')).includes(nick)) message = `${nick}: ${message}`;
      bot.client.client.say(pm || false ? nick : responseLocation, message);
    },
    runner: nick,
    args: text.startsWith(prefix) ? text.substring(prefix.length).split(' ').slice(1) : [],
    arg: text.startsWith(prefix) ? text.substring(prefix.length).split(' ').slice(1).join(' ') : '',
    todo() {
      this.respond('command is todo');
    },
    op,
    bot,
    channel: to,
  };
}

export async function handle(nick: string, to: string, text: string, bot: Bot, prefix: string, op: Rank) {
  const cmd: CmdApi = createApi(nick, to, text, bot, prefix, op);

  nickauth(nick, bot);

  if (nick === ownernick) {
    cmd.op = Rank.Owner;
  }

  if (text === '!rollcall') {
    rollcall(cmd);
    return;
  }

  if (text.startsWith(prefix) || to === bot.client.client.nick) {
    const cmdtext = text.startsWith(prefix) ? text.substring(prefix.length) : text;
    const split = cmdtext.split(' ');
    call(cmd, split[0]);
  }
}

export function init(modules: Module[]) {
  modules.forEach((mod) => loadModule(mod));
}

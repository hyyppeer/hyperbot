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
  responseLoc: string;
  ask(question: string): Promise<string>;
  confirm(): Promise<boolean>;
}

interface Command {
  name: string;
  run: (cmd: CmdApi) => void;
  authenticate: (cmd: CmdApi) => boolean;
  syntax: string;
  help: (cmd: CmdApi) => string;
}

export interface ModuleContents {
  [name: string]: Command;
}

export interface Module {
  name: string;
  help: string;
  contents: ModuleContents;
}

export function defineModule(name: string, help: string, contents: ModuleContents): Module {
  return {
    name,
    contents,
    help,
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
export const modules: Record<string, Module> = {};

function loadModule(mod: Module) {
  Logger.debug('modules', `Loading module: ${chalk.greenBright(mod.name)}`);
  modules[mod.name] = mod;
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

async function nickauth(nick: string, bot: Bot) {
  if (nick === config.auth.ownernick && ownernick !== nick) {
    const info = await bot.client.whois(nick);
    if (info.user === config.auth.ownernick) {
      ownernick = nick;
      Logger.info('mod', `Automatically OP'ed ${nick} to owner (ownernick is ${config.auth.ownernick})`);
    }
  }
}

function createApi(nick: string, to: string, text: string, bot: Bot, prefix: string, op: Rank): CmdApi {
  let responseLocation = bot.client.client.nick === to ? nick : to;
  return {
    respond(text, pm) {
      let message = text;
      if (!JSON.parse(noPingStore.get('pings') || '[]').includes(nick) && to !== bot.client.client.nick) message = `${nick}: ${message}`;
      bot.client.client.say(pm || false ? nick : responseLocation, message);
    },
    runner: nick,
    args: text.startsWith(prefix) ? text.substring(prefix.length).split(' ').slice(1) : to === bot.client.client.nick ? text.split(' ').slice(1) : [],
    arg: text.startsWith(prefix) ? text.substring(prefix.length).split(' ').slice(1).join(' ') : to === bot.client.client.nick ? text.split(' ').slice(1).join(' ') : '',
    todo() {
      this.respond('command is todo');
    },
    op,
    bot,
    channel: to,
    responseLoc: responseLocation,
    async ask(question) {
      return bot.client.question(nick, question, responseLocation);
    },
    async confirm() {
      return (await this.ask('Are you sure?')).toLowerCase().startsWith('y') ? true : false;
    },
  };
}

export async function handle(nick: string, to: string, text: string, bot: Bot, prefix: string, op: Rank) {
  const cmd: CmdApi = createApi(nick, to, text, bot, prefix, op);

  await nickauth(nick, bot);

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

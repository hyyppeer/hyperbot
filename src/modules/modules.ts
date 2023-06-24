import { types } from 'util';
import { Bot, Rank } from '../bot/bot';
import { config, noPingStore } from '../index';
import { Logger } from '../util/logger';
import chalk from 'chalk';

export enum CommandErrorId {
  RequiresIdentification,
  Forbidden,
  NotEnoughArguments,
  InvalidArguments,
  InternalFailure,
}

export interface CmdErr {
  id: CommandErrorId;
  desc: string;
  code?: string;
}

interface RespondOptions {
  pm?: boolean;
  silent?: boolean;
}

export interface CmdApi {
  respond(text: string, opts?: RespondOptions): void;
  runner: string;
  args: Array<string>;
  arg: string;
  todo(): void;
  op: Rank;
  bot: Bot;
  channel: string;
  responseLoc: string;
  ask(question: string, timeout?: string | Function): Promise<string>;
  confirm(confirmation?: string): Promise<boolean>;
  user?: string;
  identify(): Promise<string>;
}

export interface Command {
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
  contents: ModuleContents;
  register?: (bot: Bot) => void;
}

export function defineModule(name: string, contents: Command[], register?: (bot: Bot) => void): Module {
  const contobj: ModuleContents = {};

  contents.forEach((content) => {
    contobj[content.name] = content;
  });

  return {
    name,
    contents: contobj,
    register,
  };
}

export function defineCommand(name: string, syntax: string, help: ((cmd: CmdApi) => string) | string, handler: (cmd: CmdApi) => void, authenticator?: ((cmd: CmdApi) => boolean) | Rank): Command {
  return {
    name,
    run: handler,
    authenticate: authenticator ? (isRank(authenticator) ? (cmd) => cmd.op >= authenticator : authenticator) : () => true,
    syntax,
    help: typeof help === 'string' ? () => help : help,
  };
}

export const commands: Record<string, Command> = {};
export const modules: Record<string, Module> = {};

function loadModule(mod: Module, bot: Bot) {
  Logger.debug('Modules', `Loading module: ${chalk.greenBright(mod.name)}`);
  modules[mod.name] = mod;
  for (const [key, value] of Object.entries(mod.contents)) {
    commands[key] = value;
  }

  if (mod.register) mod.register(bot);
}

function isCmdErr(e: any): e is CmdErr {
  return e.id && e.desc && typeof e.id === 'number' && typeof e.desc === 'string' && e.id >= 0;
}

function isRank(v: any): v is Rank {
  const num = Number.parseInt(v);
  return !Number.isNaN(num) && num >= Rank.User && num <= Rank.Owner;
}

function handleCallError(e: any, cmd: CmdApi) {
  if (typeof e === 'number') {
    switch (e) {
      case CommandErrorId.Forbidden:
        cmd.respond('fail: forbidden');
        break;
      case CommandErrorId.InvalidArguments:
        cmd.respond('fail: arguments provided, but is not correct');
        break;
      case CommandErrorId.NotEnoughArguments:
        cmd.respond('fail: not enough arguments were provided');
        break;
      case CommandErrorId.RequiresIdentification:
        cmd.respond("fail: you've not been identified yet, try again in a few seconds");
        break;
      case CommandErrorId.InternalFailure:
      default:
        cmd.respond('fail: internal error');
        break;
    }
  } else if (isCmdErr(e)) {
    let desc = `fail: ${e.desc} (ERRNO${e.id})`;
    if (e.code) desc += ` (CODE ${e.code})`;
    cmd.respond(desc);
  } else {
    cmd.respond(`fail: ${e}`);
  }
}

function call(cmd: CmdApi, command: string) {
  const commandobj = commands[command.toLowerCase()];

  if (!commandobj) {
    return;
  }

  if (commandobj.authenticate(cmd)) {
    try {
      const returned = commandobj.run(cmd);
      if (types.isPromise(returned)) {
        returned.catch((reason) => handleCallError(reason, cmd));
      }
    } catch (e) {
      handleCallError(e, cmd);
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
      Logger.info('Moderation', `Automatically OP'ed ${nick} to owner (ownernick is ${config.auth.ownernick})`);
    }
  }
}

function createApi(nick: string, to: string, text: string, bot: Bot, op: Rank, user?: string): CmdApi {
  let responseLocation = bot.client.client.nick === to ? nick : to;
  return {
    respond(text, opts) {
      let message = text;
      if (!JSON.parse(noPingStore.get('pings') || '[]').includes(nick) && to !== bot.client.client.nick) if (!opts?.silent) message = `${nick}: ${message}`;
      bot.client.client.say(opts?.pm || false ? nick : responseLocation, message);
    },
    runner: nick,
    args: text.startsWith(config.bot.prefix) ? text.substring(config.bot.prefix.length).split(' ').slice(1) : to === bot.client.client.nick ? text.split(' ').slice(1) : [],
    arg: text.startsWith(config.bot.prefix) ? text.substring(config.bot.prefix.length).split(' ').slice(1).join(' ') : to === bot.client.client.nick ? text.split(' ').slice(1).join(' ') : '',
    todo() {
      this.respond('This command is TODO');
    },
    op,
    bot,
    channel: to,
    responseLoc: responseLocation,
    async ask(question, timeout) {
      return bot.client.question(nick, question, timeout || '', responseLocation);
    },
    async confirm(confirmation?: string) {
      return (await this.ask(confirmation || 'Are you sure?')).toLowerCase().startsWith('y') ? true : false;
    },
    user,
    async identify() {
      return new Promise((resolve) => {
        if (!bot.users[nick]) {
          bot.client.whois(nick).then((info) => {
            bot.users[nick] = info.user;
            this.user = info.user;
            resolve(info.user);
          });
        } else resolve(bot.users[nick]);
      });
    },
  };
}

export async function handle(nick: string, to: string, text: string, bot: Bot, op: Rank, user?: string) {
  const cmd: CmdApi = createApi(nick, to, text, bot, op, user);

  await nickauth(nick, bot);

  if (nick === ownernick) {
    cmd.op = Rank.Owner;
  }

  if (text === '!rollcall') {
    cmd.respond(config.messages.rollcall(config.branding.name, config.branding.owner), {
      silent: true,
    });
    return;
  }

  if (text.startsWith(config.bot.prefix) || to === bot.client.client.nick) {
    const cmdtext = text.startsWith(config.bot.prefix) ? text.substring(config.bot.prefix.length) : text;
    const split = cmdtext.split(' ');
    call(cmd, split[0]);
  }
}

export function init(modules: Module[], bot: Bot) {
  modules.forEach((mod) => loadModule(mod, bot));
}

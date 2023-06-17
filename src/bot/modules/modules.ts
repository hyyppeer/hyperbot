import { Bot, Rank } from '../bot';
import { bundle } from '../../index';
import { Logger } from '../../util/logger';

export interface CmdApi {
  respond(text: string): void;
  runner: string;
  args: Array<string>;
  arg: string;
  todo(): void;
  fail(reason: string): void;
  assert(condition: boolean, message: string): boolean;
  op: Rank;
  bot: Bot;
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
  cmd.respond(bundle['rollcall.response']());
}

export const commands: Record<string, Command> = {};

function loadModule(mod: Module) {
  Logger.debug('modules', `loading module ${mod.name}`);
  for (const [key, value] of Object.entries(mod.contents)) {
    commands[key] = value;
  }
}

function call(cmd: CmdApi, command: string, arg: string) {
  const commandobj = commands[command];

  if (!commandobj) {
    return;
  }

  if (commandobj.authenticate(cmd)) {
    commandobj.run(cmd);
  } else {
    cmd.respond(`Not permitted to run ${command}`);
  }
}

export async function handle(nick: string, to: string, text: string, bot: Bot, prefix: string, op: Rank) {
  const responseLocation = bot.client.client.nick === to ? nick : to;
  const cmd: CmdApi = {
    respond(text) {
      bot.client.client.say(responseLocation, `${nick}: ${text}`);
    },
    runner: nick,
    args: text.startsWith(prefix) ? text.substring(prefix.length).split(' ').slice(1) : [],
    arg: text.startsWith(prefix) ? text.substring(prefix.length).split(' ').slice(1).join(' ') : '',
    todo() {
      this.respond('command is todo');
    },
    fail(reason: string) {
      this.respond(`fail: ${reason}`);
    },
    assert(condition, message) {
      if (!condition) {
        this.fail(message);
      }
      return !condition;
    },
    op,
    bot,
  };

  if (text === '!rollcall') {
    rollcall(cmd);
    return;
  }

  if (text.startsWith(prefix)) {
    const cmdtext = text.substring(prefix.length);
    const split = cmdtext.split(' ');
    call(cmd, split[0], split.slice(1).join(' '));
  }
}

export function init(modules: Module[]) {
  modules.forEach((mod) => loadModule(mod));
}

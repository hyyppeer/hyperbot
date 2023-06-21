import { Rank } from '../bot/bot';
import { CmdApi, commands, defineCommand, defineModule, ModuleContents, modules } from '../modules/modules';
import { Logger } from './logger';

export type JsonCmdActionType = 'say' | 'do';

export interface JsonCmdAction {
  type: JsonCmdActionType;
  args: string[];
}

export type JsonCmdEvent = 'ran';

export interface JsonCmdListener {
  on: JsonCmdEvent;
  actions: JsonCmdAction[];
}

export interface JsonCommand {
  name: string;
  syntax: string;
  help: string;
  listeners: JsonCmdListener[];
  rankRequired?: Rank;
}

export interface JsonPackage {
  name: string;
  commands: JsonCommand[];
}

export interface PackFunctions {
  [name: string]: (cmd: CmdApi, ...args: string[]) => string | void;
}

const packfns: PackFunctions = {
  pipe(cmd, ...args) {
    const arg = args.join(',');
    const stats = arg.split('|').map((v) => v.split(','));
    let val = '';
    stats.forEach((stat) => {
      const out = packfns[stat[0]](cmd, ...stat.slice(1));
      val = out ? out : val;
    });
    return val;
  },
  join(cmd, ...args) {
    if (args.length < 2) throw 'You must enter a joiner and a list';
    return args.slice(1).join(args[0]);
  },
  say(cmd, ...args) {
    cmd.respond(args.join(','));
  },
  void(cmd, ...args) {
    packfns[args[0]](cmd, ...args.slice(1));
  },
};

function parseArgArr(arr: string[], cmd: CmdApi): string {
  const variables: Record<string, any> = {
    user: cmd.runner,
    argstr: cmd.arg,
    arg0: cmd.args[0],
    arg1: cmd.args[1],
    arg2: cmd.args[2],
    arglen: cmd.args.length,
  };

  let parts: string[] = [];

  arr.forEach((value) => {
    if (value.startsWith('$$')) {
      parts.push(variables[value.substring(2)] || value);
    } else if (value.startsWith('$!')) {
      const arg = value.split(',');
      try {
        const out = packfns[arg[0]](cmd, ...arg.slice(1));
        if (out) parts.push(out);
      } catch (e) {
        parts.push(value);
        Logger.error('jsoncmds', `Error evaluating $!: ${e}`);
      }
    } else {
      parts.push(value);
    }
  });

  return parts.join('');
}

export class JsonCommands {
  static encoding: BufferEncoding = 'base64';
  static createPackage(pkg: JsonPackage): string {
    return this.compress(JSON.stringify(pkg));
  }

  static loadPackage(pkgstr: string) {
    const pkg: JsonPackage = JSON.parse(this.decompress(pkgstr));
    let contents: ModuleContents = {};

    pkg.commands.forEach((command) => {
      const ranListeners: JsonCmdListener[] = command.listeners.filter((listener) => listener.on === 'ran');

      contents[command.name] = defineCommand(
        command.name,
        command.syntax,
        command.help,
        (cmd) => {
          ranListeners.forEach((listener) => {
            listener.actions.forEach((action) => {
              switch (action.type) {
                case 'say':
                  cmd.respond(parseArgArr(action.args, cmd));
                  break;
                case 'do':
                  cmd.bot.client.client.action(cmd.channel === cmd.bot.client.client.nick ? cmd.runner : cmd.channel, parseArgArr(action.args, cmd));
                  break;
                default:
                  break;
              }
            });
          });
        },
        (cmd) => cmd.op >= (command.rankRequired || Rank.User)
      );
      commands[command.name] = contents[command.name];
    });

    modules[pkg.name] = defineModule(pkg.name, contents);
  }

  static unloadPackage(pkgstr: string) {
    const pkg: JsonPackage = JSON.parse(this.decompress(pkgstr));

    delete modules[pkg.name];
    pkg.commands.forEach((command) => {
      delete commands[command.name];
    });
  }

  static compress(uncompressed: string): string {
    return Buffer.from(uncompressed, 'ascii').toString(this.encoding);
  }

  static decompress(compressed: string): string {
    return Buffer.from(compressed, this.encoding).toString('ascii');
  }
}

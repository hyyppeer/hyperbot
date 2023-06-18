import { Rank } from '../bot/bot';
import { CmdApi, commands, defineCommand, defineModule, ModuleContents, modules } from '../bot/modules/modules';

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
  help: string;
  commands: JsonCommand[];
}

function parseArgArr(arr: string[], cmd: CmdApi): string {
  const variables: Record<string, any> = {
    user: cmd.runner,
    argstr: cmd.arg,
  };

  let parts: string[] = [];

  arr.forEach((value) => {
    if (value.startsWith('$$')) {
      parts.push(variables[value.substring(2)]);
    } else {
      parts.push(value);
    }
  });

  return parts.join('');
}

export class JsonCommands {
  static createPackage(pkg: JsonPackage): string {
    return JSON.stringify(pkg);
  }

  static loadPackage(pkgstr: string) {
    const pkg: JsonPackage = JSON.parse(pkgstr);
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

    modules[pkg.name] = defineModule(pkg.name, pkg.help, contents);
  }
}

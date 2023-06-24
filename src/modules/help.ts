import { config } from '..';
import { Module, defineModule, defineCommand, commands, CmdApi, modules } from './modules';

const topics: Record<string, string | ((cmd: CmdApi) => string)> = {
  'getting-started': 'Use modules to get a list of modules then help <command> to get info about a specific command, good luck on your journey!',
  'commands-list': () => {
    const list = Object.keys(commands);

    return `Here is a list of all commands: ${list.join(' ')}`;
  },
};

function getHelp(name: string, cmd: CmdApi) {
  let string = '';
  if (commands[name]) {
    string = `Command ${name}: `;
    string += `Syntax: ${config.bot.prefix}${name}`;
    if (commands[name].syntax) string += ` ${commands[name].syntax}`;
    string += `, Help: ${commands[name].help(cmd)}`;
  } else if (topics[name]) {
    const topic = topics[name];
    string = `Topic ${name}: ${typeof topic === 'string' ? topic : topic(cmd)}`;
  } else {
    string = `${name} doesn't exist :(`;
  }
  return string;
}

export const help: Module = defineModule('help', [
  defineCommand('modules', '', 'Get a list of all modules', (cmd) => {
    cmd.respond(Object.keys(modules).join(' '));
  }),
  defineCommand('help', '[<command>]', 'Get help about a specific command/topic or list all commands and topics', (cmd) => {
    if (cmd.arg) cmd.respond(getHelp(cmd.arg, cmd));
    else cmd.respond(`Use ${config.bot.prefix}modules to get a list of modules, use ${config.bot.prefix}commands <module> to get a list of commands in a module, use ${config.bot.prefix}help <command> to get help on a command`);
  }),
  defineCommand('commands', '<module>', 'Get the names of the commands in a module', (cmd) => {
    if (!cmd.arg) throw 'No module provided';

    if (modules[cmd.arg]) cmd.respond(Object.keys(modules[cmd.arg].contents).join(' '));
    else cmd.respond('No such module :(');
  }),
]);

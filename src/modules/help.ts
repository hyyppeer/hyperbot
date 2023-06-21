import { config } from '..';
import { Module, defineModule, defineCommand, commands, CmdApi, modules, CommandErrorId } from './modules';

const topics: Record<string, string | ((cmd: CmdApi) => string)> = {
  'getting-started': 'use help to get a list of commands then help <command> to get info about a specific command, good luck on your journey!',
  commands: () => {
    const list = Object.keys(commands);

    return `here is a list of all commands: ${list.join(' ')}`;
  },
};

function getHelp(name: string, cmd: CmdApi) {
  let string = '';
  if (commands[name]) {
    string = `command ${name}: `;
    string += `syntax: ${config.bot.prefix}${name}`;
    if (commands[name].syntax) string += ` ${commands[name].syntax}`;
    string += `, help: ${commands[name].help(cmd)}`;
  } else if (topics[name]) {
    const topic = topics[name];
    string = `topic ${name}: ${typeof topic === 'string' ? topic : topic(cmd)}`;
  } else {
    string = `${name} doesn't exist :(`;
  }
  return string;
}

export const help: Module = defineModule('help', {
  modules: defineCommand('modules', '', 'get a list of all modules', (cmd) => {
    cmd.respond(Object.keys(modules).join(' '));
  }),
  help: defineCommand('help', '[<command>]', 'get help about a specific command/topic or list all commands and topics', (cmd) => {
    if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

    cmd.respond(getHelp(cmd.arg, cmd));
  }),
});

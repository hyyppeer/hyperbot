import { replaceAll } from '../../util/polyfills';
import { Bot } from '../bot';
import { Module, defineModule } from './modules';

interface Command {
  run: (i: Interface, ...args: string[]) => void;
}

enum FailCode {
  Internal = 10,
  BotError = 20,
  UserError = 30,
}

class Interface {
  bot: Bot;
  nick: string;
  constructor(bot: Bot, nick: string) {
    this.bot = bot;
    this.nick = nick;
  }

  info(message: string) {
    this.response('info', message);
  }
  dev(message: string) {
    this.response('dev', message);
  }
  fail(message: string, code: FailCode) {
    this.response('fail', code.toString(), message);
  }

  response(...args: string[]) {
    const [prefix, ...arg] = args.map((v) => v.replace('~~', '\\~~'));
    this.bot.client.client.say(this.nick, `${prefix}~~${replaceAll(arg.join('~~'), '\n', `\n${prefix}~~`)}`);
  }
}

function mkCommand(run: (i: Interface, ...args: string[]) => void): Command {
  return { run };
}

const apiInfo = `Welcome to the bot api!
This api can be used internally by bots to provide services to their users
This is still very work in progress, please be patient
All api requests are sent in a PM to the bot, the message must start with %%
Then a command, then the arguments for the command. All seperated by double ~s`;

const helps: Record<string, string> = {
  responses: `When the bot responds it will respond with lines consisting of &&<response-code><double ~s><response-data>
The data will be seperated using double ~ as normal`,
  'response-codes': `There are many response codes/commands the bot can reply with:
info: indicates information that should be displayed to the user
dev: indicates information that you (the developer) should see
fail: indicates a failure in the command. the second argument will be a status code of the failure`,
  'status-codes': `When a response fails, it will send fail<double ~s><status code><double ~s><extra data>
Here is a list of status codes:
1x: internal error
2x: error by the bot using the api
3x: error from the user using your bot
the second digit indicates more specific information, to be documented at a later time.`,
};

function help(name: string): string {
  return helps[name] || 'No help found :(';
}

const cmds: Record<string, Command> = {
  help: mkCommand((i, name) => {
    if (name) i.info(help(name));
    else i.info(`${apiInfo}\nList of all helps: ${Object.keys(helps).join(' ')}`);
  }),
};

function call(cmd: string, args: string[], i: Interface) {
  cmds[cmd]?.run(i, ...args);
}

function handle(text: string, i: Interface) {
  const split = text.split('~~');
  const command = split[0];
  const args = split.slice(1);
  call(command, args, i);
}

export const botapi: Module = defineModule('botapi', 'defines a set of commands that allows other bots to interact with it, pm the bot %%help for info', {}, (bot) => {
  bot.client.client.on('pm', (nick, text) => {
    if (!text.startsWith('%%')) return;
    const i = new Interface(bot, nick);
    handle(text.substring(2), i);
  });
});

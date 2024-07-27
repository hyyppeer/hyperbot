import { Bot } from '../bot';
import { Logger } from '../../util/logger'

export class Cli {
  prefix: string = '\\';
  constructor(private bot: Bot) {
    this.bot = bot;

    process.stdin.on('data', (data) => {
      this.handle(data.toString('utf8'));
    });
  }

  private handle(text: string) {
    if (text.startsWith(this.prefix)) {
      Logger.debug('Cli', 'Starts with prefix')
      const cmdstr = text.substring(this.prefix.length);

      const split = cmdstr.split(' ');
      const command = split[0];
      const args = split.slice(1);
      const arg = args.join(' ');

      this.cmd(command, args, arg);
    }
  }

  private cmd(command: string, args: string[], arg: string) {
    switch (command) {
      case 'op':
        if (args.length < 2) break;
        this.bot.op(args[0], Number.parseFloat(args[1]));
        break;
      case 'deop':
        if (args.length < 1) break;
        this.bot.deop(args[0]);
        break;
      case 'js':
        eval(arg);
        break;
      default:
        break;
    }
  }
}

import { Bot, Rank } from '../bot';

export class Cli {
  bot: Bot;
  prefix: string = '\\';
  constructor(bot: Bot) {
    this.bot = bot;

    process.stdin.on('data', (data) => {
      this.handle(data.toString('utf8'));
    });
  }

  private handle(text: string) {
    if (text.startsWith(this.prefix)) {
      const cmdstr = text.substring(this.prefix.length);

      const split = cmdstr.split(' ');
      const command = split[0];
      const args = split.slice(1);
      const arg = split.slice(1).join(' ');

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
        eval(args.join(' '));
        break;
      default:
        break;
    }
  }
}

import chalk from 'chalk';

export enum LogLevel {
  Debug,
  Verbose,
  Info,
  Warn,
  Error,
  Fatal,
}

export class Logger {
  private static loglvl: LogLevel;
  private static wrap(starter: string, message: string) {
    const width = process.stdout.columns - starter.length;
    const regex = new RegExp(`.{0,${width}}`, 'g');
    let lines = message.match(regex);

    return lines
      ?.filter((v) => !!v)
      .map((value) => `${starter}${value}`)
      .join('\n');
  }
  private static log(color: chalk.ChalkFunction, char: string, ctx: string, message: string, lvl: LogLevel) {
    const ts = new Date();
    const tstext = chalk.grey(`${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}`);
    const logchar = color(`-${char}-`);
    const ctxt = color(`${ctx} | `.padStart(13, ' '));
    const starter = `${tstext} ${logchar} ${ctxt}`;
    if (lvl >= this.loglvl) console.log(this.wrap(starter, message));
  }

  static set level(lvl: LogLevel) {
    this.loglvl = lvl;
  }

  static debug(ctx: string, message: string) {
    this.log(chalk.cyanBright, 'D', ctx, message, LogLevel.Debug);
  }
  static verbose(ctx: string, message: string) {
    this.log(chalk.greenBright, 'V', ctx, message, LogLevel.Verbose);
  }
  static info(ctx: string, message: string) {
    this.log(chalk.blue, 'I', ctx, message, LogLevel.Info);
  }
  static warn(ctx: string, message: string) {
    this.log(chalk.yellow, 'W', ctx, message, LogLevel.Warn);
  }
  static error(ctx: string, message: string) {
    this.log(chalk.redBright, 'E', ctx, message, LogLevel.Error);
  }
  static fatal(ctx: string, message: string) {
    this.log(chalk.grey, 'F', ctx, message, LogLevel.Fatal);
  }
}

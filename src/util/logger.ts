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
  private static log(color: chalk.ChalkFunction, char: string, ctx: string, message: string, lvl: LogLevel) {
    const ts = new Date();
    const tstext = chalk.grey(`[${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')}]`);
    const logchar = color(`[${char}]`);
    const ctxt = color(`[${ctx}]: `.padEnd(13, ' '));
    if (lvl >= this.loglvl) console.log(`${tstext} ${logchar} ${ctxt}${message}`);
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

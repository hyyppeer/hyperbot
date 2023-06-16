import chalk from 'chalk';

export class Logger {
  private static log(color: chalk.ChalkFunction, char: string, ctx: string, message: string) {
    console.log(`${color(`[${char}]`)} [${ctx}]: ${message}`);
  }

  static verbose(ctx: string, message: string) {
    this.log(chalk.cyanBright, 'V', ctx, message);
  }
  static info(ctx: string, message: string) {
    this.log(chalk.blue, 'I', ctx, message);
  }
  static warn(ctx: string, message: string) {
    this.log(chalk.yellow, 'W', ctx, message);
  }
  static error(ctx: string, message: string) {
    this.log(chalk.redBright, 'E', ctx, message);
  }
  static fatal(ctx: string, message: string) {
    this.log(chalk.grey, 'F', ctx, message);
  }
}

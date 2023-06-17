import chalk from 'chalk';
import { Logger } from '../../../util/logger';

const irc: Irc = require('irc');

export class Client {
  client: IrcClient;
  constructor(server: string, port: number, nickname: string, secure: boolean, channels: string[]) {
    Logger.info('client', `connecting to ${chalk.redBright(`${server}:${port}`)} as ${chalk.greenBright(nickname)} (secure? ${secure ? chalk.greenBright('yes') : chalk.redBright('no')}) in ${channels.join(' ')}`);
    this.client = new irc.Client(server, nickname, {
      channels,
      port,
      secure,
      autoConnect: true,
      userName: nickname,
      realName: nickname,
      floodProtection: true,
    });
    this.client.on('message', (nick, to, text) => {
      const locator = chalk.grey(`${to} <- ${nick}`.padEnd(19, ' '));
      Logger.verbose('chat', `${locator}: ${text}`);
    });
    this.client.on('selfMessage', (to, text) => {
      const locator = chalk.grey(`${nickname} -> ${to}`.padEnd(19, ' '));
      Logger.verbose('chat', `${locator}: ${text}`);
    });
  }
}

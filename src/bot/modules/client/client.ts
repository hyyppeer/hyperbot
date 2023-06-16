import { Logger } from '../../../util/logger';

const irc: Irc = require('irc');

export class Client {
  client: IrcClient;
  constructor(server: string, port: number, nickname: string, secure: boolean, channels: string[]) {
    Logger.info('client', `connecting to ${server}:${port} as ${nickname} (secure? ${secure}) in ${channels}`);
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
      Logger.verbose('chat', `${nick} -> ${to}: ${text}`);
    });
    this.client.on('selfMessage', (to, text) => {
      Logger.verbose('chat', `${nickname} -> ${to}: ${text}`);
    });
  }
}

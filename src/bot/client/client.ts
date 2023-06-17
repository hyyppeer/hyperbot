import chalk from 'chalk';
import { Logger } from '../../util/logger';
import { Irc, IrcClient } from './irc';

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
    this.client.on('action', (from, to, text) => {
      const locator = chalk.grey(`${to} * ${from}`);
      Logger.verbose('chat', `${locator} ${text}`);
    });
    this.client.on('+mode', (chan, by, mode, arg) => {
      Logger.verbose('chat', `${chan}: ${by} sets +${mode} on ${arg}`);
    });
    this.client.on('-mode', (chan, by, mode, arg) => {
      Logger.verbose('chat', `${chan}: ${by} sets -${mode} on ${arg}`);
    });
    this.client.on('ctcp-notice', (from, to, text) => {
      Logger.verbose('chat', `${from} -> ${to}: [NOTICE] ${text}`);
    });
    this.client.on('ctcp-version', (from, to) => {
      Logger.verbose('chat', `${from} -> ${to}: [VERSION]`);
    });
    this.client.on('invite', (chan, from) => {
      Logger.verbose('chat', `${from} has invited you to join ${chan}!`);
    });
    this.client.on('kick', (chan, nick, by, reason) => {
      Logger.verbose('chat', `${nick} was kicked from ${chan} by ${by} for ${reason}`);
    });
    this.client.on('part', (chan, nick, reason) => {
      Logger.verbose('chat', `${nick} has left ${chan}: ${reason}`);
    });
    this.client.on('join', (chan, nick) => {
      Logger.verbose('chat', `${nick} has joined ${chan}`);
    });
  }
}

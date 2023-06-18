import chalk from 'chalk';
import { Logger } from '../../util/logger';
import { Irc, IrcClient, WhoisInfo } from './irc';

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

    this.startLogging(server, port, nickname);
  }

  private startLogging(server: string, port: number, nickname: string) {
    this.client.on('message', (nick, to, text) => {
      const locator = chalk.grey(`${to} <- ${nick}`.padEnd(19, ' '));
      Logger.verbose('chat', `${locator}: ${text}`);
    });
    this.client.on('selfMessage', (to, text) => {
      const locator = chalk.grey(`${nickname} -> ${to}`.padEnd(19, ' '));
      Logger.verbose('chat', `${locator}: ${text}`);
    });
    this.client.on('action', (from, to, text) => {
      const locator = chalk.grey(`${to} *`);
      Logger.verbose('chat', `${locator} ${from} ${text}`);
    });
    this.client.on('+mode', (chan, by, mode, arg) => {
      Logger.verbose('chat', `${chan}: ${by} sets +${mode} on ${arg}`);
    });
    this.client.on('-mode', (chan, by, mode, arg) => {
      Logger.verbose('chat', `${chan}: ${by} sets -${mode} on ${arg}`);
    });
    this.client.on('notice', (nick, to, text) => {
      Logger.verbose('chat', `${nick || `${server}:${port}`} -> ${to}: [NOTICE] ${text}`);
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
    this.client.on('motd', (motd) => {
      motd
        .split('\n')
        .filter((ln) => !!ln)
        .forEach((line) => Logger.verbose('motd', line));
    });
    this.client.on('topic', (channel, topic, nick) => {
      Logger.verbose('chat', `${chalk.grey(`Topic for (${channel}) set by (${nick}): `)}${topic}`);
    });
    this.client.on('whois', (info) => {
      Logger.verbose('whois', `${info.nick} is...`);
      Logger.verbose('whois', `in ${(info.channels || []).join(', ') || 'no channels.'}`);
      if (info.operator) Logger.verbose('whois', `operator: ${info.operator}`);
      Logger.verbose('whois', `${info.user}@${info.host}`);
      if (info.serverinfo) Logger.verbose('whois', `serverinfo: ${info.serverinfo}`);
      if (info.server) Logger.verbose('whois', `server: ${info.server}`);
      Logger.verbose('whois', `real name: ${info.realname}`);
    });
  }

  async whois(nick: string): Promise<WhoisInfo> {
    return new Promise((resolve) => {
      this.client.whois(nick, resolve);
    });
  }
}

import chalk from 'chalk';
import { Logger } from '../../util/logger';
import { Irc, IrcClient, WhoisInfo } from './irc';
import { logClient } from './log';

const irc: Irc = require('irc');

export class Client {
  questionTimeout: number = 60 * 1000;
  client: IrcClient;
  private questionCallbackTable: Record<string, (answer: string) => void> = {};
  private learntQuestioning: string[] = [];
  private whoisCache: Record<string, WhoisInfo> = {};
  constructor(public server: string, public port: number, public nickname: string, secure: boolean, channels: string[], username?: string, realname?: string) {
    Logger.info('client', `Connecting to ${chalk.redBright(`${server}:${port}`)} as ${chalk.greenBright(nickname)} (secure? ${secure ? chalk.greenBright('yes') : chalk.redBright('no')}) in ${channels.join(' ')}`);
    this.client = new irc.Client(server, nickname, {
      channels,
      port,
      secure,
      autoConnect: true,
      userName: username || nickname,
      realName: realname || nickname,
      floodProtection: true,
    });

    logClient(this);

    this.client.on('message', (nick, to, text) => {
      if (!(this.questionCallbackTable[nick] && text.toLowerCase().startsWith('a> '))) return;
      this.questionCallbackTable[nick](text.substring(3));
      this.learntQuestioning.includes(nick) ? undefined : this.learntQuestioning.push(nick);
    });
    this.client.on('quit', (nick) => {
      delete this.whoisCache[nick];
    });
  }

  async whois(nick: string): Promise<WhoisInfo> {
    return new Promise((resolve) => {
      if (this.whoisCache[nick]) {
        Logger.debug('client', `Whois for ${nick} is cached`);
        resolve(this.whoisCache[nick]);
        return;
      }
      this.client.whois(nick, (info) => {
        this.whoisCache[nick] = info;
        resolve(info);
      });
    });
  }

  private questionCb(nick: string, callback: (answer: string) => void, loc: string, question: string, timeout: string | Function): void {
    this.client.say(loc, `${nick} ?> ${question}${this.learntQuestioning.includes(nick) ? '' : '\nRespond by saying "A> [your answer here]"'}`);
    const timeid = setTimeout(() => {
      delete this.questionCallbackTable[nick];
      this.client.say(nick, `Timeout for question: ${question}`);
      if (typeof timeout === 'string') callback(timeout);
      else callback(timeout());
    }, this.questionTimeout);
    this.questionCallbackTable[nick] = (ans) => {
      clearTimeout(timeid);
      callback(ans);
    };
  }

  async question(nick: string, question: string, timeout: string | Function = '', loc: string = nick): Promise<string> {
    return new Promise((resolve) => {
      this.questionCb(nick, resolve, loc, question, timeout);
    });
  }
}

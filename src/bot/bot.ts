import { Client } from './client/client';
import { Config } from '../util/config';
import { Logger } from '../util/logger';
import { Module, handle, init } from '../modules/modules';
import { LastSeen } from './services/lastseen';

export enum Rank {
  User = 0,
  Owner = 3,
  Admin = 2,
  Moderator = 1,
}

export class Bot {
  client: Client;
  connected: boolean = false;
  users: Record<string, string> = {};
  private ops: {
    [name: string]: Rank;
  } = {};
  private chanops: {
    [chan: string]: {
      [name: string]: Rank;
    };
  } = {};
  constructor(config: Config, modules: Module[]) {
    this.client = new Client(config.conn.server, config.conn.port, config.branding.name, config.conn.secure, config.bot.channels, config.branding.username, config.branding.realname);
    init(modules, this);

    this.client.client.on('message', (nick, to, text, message) => {
      handle(nick, to, text, this, this.oprank(nick, to), message, this.users[nick]);
      if (!this.users[nick]) {
        if (message.user) {
          this.users[nick] = message.user;
        } else
          this.client.whois(nick).then((info) => {
            this.users[nick] = info.user;
          });
      }
    });
    this.client.client.on('join', (channel, nick) => {
      if (nick === this.client.client.nick) {
        this.client.client.say(channel, config.messages.join(config.branding.name, config.branding.owner));
      }
    });
    this.client.client.on('quit', (nick) => {
      if (this.ops[nick]) delete this.ops[nick];
      if (this.users[nick]) delete this.users[nick];
    });
    this.client.client.on('registered', () => {
      this.connected = true;
      Logger.debug('Bot', 'Registered on network');
    });
  }

  op(nick: string, rank: Rank) {
    Logger.info('Moderation', `${nick} is now OP ${rank}`);
    this.ops[nick] = rank;
  }

  chanop(nick: string, rank: Rank, channel: string) {
    Logger.info('Moderation', `${nick} is now OP ${rank} in channel ${channel}`);
    if (this.chanops[channel]) this.chanops[channel][nick] = rank;
  }

  deop(nick: string) {
    Logger.info('Moderation', `${nick} is no longer OP`);
    if (this.ops[nick]) delete this.ops[nick];
  }

  dechanop(nick: string, channel: string) {
    Logger.info('Moderation', `${nick} is no longer OP in ${channel}`);
    if (this.chanops[channel] && this.chanops[channel][nick]) delete this.chanops[channel][nick];
  }

  oprank(nick: string, channel: string): Rank {
    let rank = this.ops[nick] || Rank.User;
    if (this.chanops[channel] && this.chanops[channel][nick] && this.chanops[channel][nick] > rank) rank = this.chanops[channel][nick];
    return rank;
  }

  psa(info: string) {
    Object.keys(this.client.client.chans).forEach((channel) => {
      this.client.client.say(channel, `***PSA***: ${info}`);
    });
  }
}

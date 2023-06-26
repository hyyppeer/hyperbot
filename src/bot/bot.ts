import { Client } from './client/client';
import { Config } from '../util/config';
import { Logger } from '../util/logger';
import { Module, handle, init } from '../modules/modules';

export enum Rank {
  User = 0,
  Owner = 3,
  Admin = 2,
  Moderator = 1,
}

export class Bot {
  clients: Client[];
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
    this.clients = [];
    config.conn.servers.forEach((server: [string, number, boolean]) => {
      this.clients.push(new Client(server[0], server[1], config.branding.name, server[2], config.bot.channels, config.branding.username, config.branding.realname));
    });

    init(modules, this);

    this.clients.forEach((client) => {
      client.client.on('message', (nick, to, text, message) => {
        handle(nick, to, text, this, this.oprank(nick, to), message, client, this.users[nick]);
        if (!this.users[nick]) {
          if (message.user) {
            this.users[nick] = message.user;
          } else
            client.whois(nick).then((info) => {
              this.users[nick] = info.user;
            });
        }
      });
      client.client.on('join', (channel, nick) => {
        if (nick === client.client.nick) {
          client.client.say(channel, config.messages.join(config.branding.name, config.branding.owner));
        }
      });
      client.client.on('quit', (nick) => {
        if (this.ops[nick]) delete this.ops[nick];
        if (this.users[nick]) delete this.users[nick];
      });
      client.client.on('registered', () => {
        this.connected = true;
        Logger.debug('Bot', 'Registered on network');
      });
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
    this.clients.forEach((client) => {
      const chans = Object.keys(client.client.chans);

      chans.forEach((chan) => client.client.say(chan, `**PSA**: ${info}`));
    });
  }
}

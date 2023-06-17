import { Client } from './client/client';
import { Config, Bundle } from '../util/config';
import { Logger } from '../util/logger';
import { fun } from './modules/fun';
import { moderation } from './modules/moderation';
import { handle, init } from './modules/modules';
import { utility } from './modules/utility';

export enum Rank {
  User = 0,
  Owner = 3,
  Admin = 2,
  Moderator = 1,
}

export class Bot {
  client: Client;
  connected: boolean = false;
  private ops: {
    [name: string]: Rank;
  } = {};
  private chanops: {
    [chan: string]: {
      [name: string]: Rank;
    };
  } = {};
  constructor(config: Config, bundle: Bundle) {
    this.client = new Client(config.conn.server, config.conn.port, config.branding.name, config.conn.secure, config.bot.channels);
    init([utility, moderation, fun]);

    this.client.client.on('message', async (nick, to, text) => {
      await handle(nick, to, text, this, '-', this.oprank(nick, to));
    });
    this.client.client.on('join', (channel, nick) => {
      if (nick === this.client.client.nick) this.client.client.say(channel, bundle['text.onjoin'](config.branding.name, config.branding.owner));
    });
    this.client.client.on('quit', (nick) => {
      if (this.ops[nick]) delete this.ops[nick];
    });
    this.client.client.on('registered', () => {
      this.connected = true;
      Logger.debug('bot', 'Registered on network');
    });
  }

  op(nick: string, rank: Rank) {
    Logger.info('mod', `${nick} is now OP ${rank}`);
    this.ops[nick] = rank;
  }

  chanop(nick: string, rank: Rank, channel: string) {
    Logger.info('mod', `${nick} is now OP ${rank} in channel ${channel}`);
    if (this.chanops[channel]) this.chanops[channel][nick] = rank;
  }

  deop(nick: string) {
    Logger.info('mod', `${nick} is no longer OP`);
    if (this.ops[nick]) delete this.ops[nick];
  }

  dechanop(nick: string, channel: string) {
    Logger.info('mod', `${nick} is no longer OP in ${channel}`);
    if (this.chanops[channel] && this.chanops[channel][nick]) delete this.chanops[channel][nick];
  }

  oprank(nick: string, channel: string): Rank {
    let rank = this.ops[nick] || Rank.User;
    if (this.chanops[channel] && this.chanops[channel][nick] && this.chanops[channel][nick] > rank) rank = this.chanops[channel][nick];
    return rank;
  }
}

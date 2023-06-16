import { Client } from './modules/client/client';
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
  constructor(config: Config, bundle: Bundle) {
    this.client = new Client(config.conn.server, config.conn.port, config.branding.name, config.conn.secure, config.bot.channels);
    init([utility, moderation, fun]);

    this.client.client.on('message', async (nick, to, text, message) => {
      await handle(nick, to, text, this, '-', this.oprank(nick));
    });
    this.client.client.on('join', (channel, nick) => {
      if (nick === this.client.client.nick) this.client.client.say(channel, bundle['text.onjoin']());
    });
    this.client.client.on('quit', (nick) => {
      if (this.ops[nick]) delete this.ops[nick];
    });
    this.client.client.on('registered', () => {
      this.connected = true;
      Logger.info('bot', 'registered');
    });
  }

  op(nick: string, rank: Rank) {
    Logger.info('mod', `OP'ing ${nick}`);
    this.ops[nick] = rank;
  }

  deop(nick: string) {
    if (this.ops[nick]) delete this.ops[nick];
  }

  oprank(nick: string): Rank {
    return this.ops[nick] || Rank.User;
  }
}

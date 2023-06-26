import { Client } from '../client/client';

export class NickServ {
  static async identity(nick: string, client: Client, method: 'msg' | 'raw'): Promise<boolean> {
    return new Promise((resolve) => {
      if (method === 'msg') {
        client.client.say('NickServ', `STATUS ${nick}`);
      }
      client.client.on('message', (nick, to, text) => {
        if (to === client.client.nick && nick === 'NickServ' && text.startsWith(`STATUS ${nick} `)) {
          resolve(Number.parseInt(text.substring(`STATUS ${nick} `.length - 1, `STATUS ${nick} `.length)) > 0);
        }
      });
    });
  }
}

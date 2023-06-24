import { lastSeenStore } from '../..';
import { Logger } from '../../util/logger';

export class LastSeen {
  static seen(nick: string) {
    lastSeenStore.set(nick, Date.now().toString());
    Logger.debug('Last seen', `saw ${nick}`);
  }

  static seeall(nicks: string[]) {
    nicks.forEach((nick) => {
      lastSeenStore.set(nick, Date.now().toString());
    });
    Logger.debug('Last seen', `Saw all of ${nicks.join(' ')}`);
  }
}

import { lastSeenStore } from '../..';

interface SeenInfo {
  time: number;
  message: string;
}

export class LastSeen {
  static seen(nick: string, message: string) {
    const info: SeenInfo = {
      time: Date.now(),
      message,
    };

    lastSeenStore.set(nick, JSON.stringify(info));
  }

  static when(nick: string): SeenInfo {
    return JSON.parse(lastSeenStore.get(nick) || '{"time":0,"message":""}');
  }
}

import { Bot } from '../bot/bot';
import { Logger } from './logger';

export interface ExtApi {
  bot: Bot;
  log: Logger;
}

function createExtApi(bot: Bot): ExtApi {
  return {
    bot,
    log: Logger,
  };
}

export class Extension {
  static execute(extsrc: string, bot: Bot) {
    const ext = createExtApi(bot);
    eval(extsrc);
  }
}

import { Bot } from '../bot/bot';
import * as modules from '../bot/modules/modules';
import { Shell } from '../bot/services/town/shell';
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
  static execute(extsrc: string, bot: Bot, cmd: modules.CmdApi) {
    const ext = createExtApi(bot);
    const $modules = modules;
    const $shell = Shell;
    const $ = cmd;
    eval(extsrc);
  }
}

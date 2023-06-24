import { Bot } from '../bot/bot';
import * as modules from '../modules/modules';
import { Shell } from '../bot/services/town/shell';
import { Logger } from './logger';
import { createContext, runInContext } from 'vm';
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

export const util = {
  random<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },
};

export class Extension {
  static execute(extsrc: string, bot: Bot, cmd?: modules.CmdApi): any {
    const context = createContext({
      ext: createExtApi(bot),
      $modules: modules,
      $shell: Shell,
      $: cmd,
      _: util,
    });

    return runInContext(extsrc, context, {});
  }
  static eval(extsrc: string, bot: Bot, cmd?: modules.CmdApi): any {
    const ext = createExtApi(bot);
    const $modules = modules;
    const $shell = Shell;
    const $ = cmd;
    const _ = util;

    return eval(extsrc);
  }
}

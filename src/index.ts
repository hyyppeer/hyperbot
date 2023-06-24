import { Bot } from './bot/bot';
import { Cli } from './bot/services/cli';
import { Reminder } from './bot/services/reminders';
import { Shell } from './bot/services/town/shell';
import { botany } from './modules/botany';
import { ducks } from './modules/ducks';
import { extension } from './modules/extension';
import { fun } from './modules/fun';
import { help } from './modules/help';
import { moderation } from './modules/moderation';
import { packages } from './modules/packages';
import { reminders } from './modules/reminders';
import { repl } from './modules/repl';
import { rust } from './modules/rust';
import { social } from './modules/social';
import { utility } from './modules/utility';
import { readConfig } from './util/config';
import { Store } from './util/db';
import { Logger, LogLevel } from './util/logger';

export const config = readConfig('D:/hyperbot-town-irc/config/bot.conf');

export const noPingStore = new Store('noping');
export const lastSeenStore = new Store('lastseen');
export const reminderStore = new Store('reminders');
export const duckStore = new Store('duck');
export const hpmStore = new Store('hpm');

async function start() {
  Logger.level = LogLevel.Debug;

  await Shell.start();
  const bot = new Bot(config, [utility, moderation, fun, social, packages, reminders, repl, help, rust, ducks, botany, extension /*, tips*/]);
  const cli = new Cli(bot);

  Reminder.init(bot);

  process.on('uncaughtException', (error, origin) => {
    Logger.error('Process', `Uncaught exception has occurred: ${error.name}: ${error.message} (from ${origin})\n${error.stack}`);
    bot.client.client.say(config.errors.notifications, 'uncaught exception occurred');
  });
}

start();

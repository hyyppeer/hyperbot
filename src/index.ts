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
import { load } from './util/userdata';

export const config = readConfig('D:/hyperbot-town-irc/config/bot.conf');

export const noPingStore = new Store('noping');
export const lastSeenStore = new Store('lastseen');
export const reminderStore = new Store('reminders');
export const hpmStore = new Store('hpm');

async function start() {
  Logger.level = LogLevel.Debug;

  load();
  await Shell.start();
  const bot = new Bot(config, [utility, moderation, fun, social, packages, reminders, repl, help, rust, ducks, botany, extension /*, tips*/]);
  const cli = new Cli(bot);

  Reminder.init(bot);

  process.on('uncaughtException', (error, origin) => {
    Logger.error('Process', `Uncaught exception has occurred: ${error.name}: ${error.message} (from ${origin})\n${error.stack}`);
    // bot.clients.client.say(config.errors.notifications, 'uncaught exception occurred');
  });
  process.on('unhandledRejection', (reason, promise) => {
    Logger.warn('Process', `Unhandled rejection (${reason}) at ${promise}`);
  });
  process.on('SIGPWR', (signal) => {
    Logger.fatal('SIGNALS', `adios mi amigo (SIGPWR ${signal})`);
  });
  process.on('SIGABRT', (signal) => {
    Logger.fatal('SIGNALS', `SIGABRT ${signal}`);
    bot.clients.forEach((client) => client.client.disconnect('SIGABRT on bot process'));
  });
  process.on('SIGIOT', (signal) => {
    Logger.fatal('SIGNALS', `SIGIOT ${signal}`);
  });
  process.on('SIGTERM', (signal) => {
    bot.clients.forEach((client) => client.client.disconnect('the user has requested that the bot disconnect'));
    Logger.fatal('SIGNALS', `SIGTERM ${signal}`);
  });
}

start().catch((reason) => {
  Logger.fatal('Process', `Start rejected: ${reason}`);
  process.exit(1);
});

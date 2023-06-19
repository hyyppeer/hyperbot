import { Bot } from './bot/bot';
import { Cli } from './bot/services/cli';
import { Dashboard } from './bot/services/dashboard/dashboard';
import { Shell } from './bot/services/town/shell';
import { readBundle, readConfig } from './util/config';
import { Store } from './util/db';
import { Logger, LogLevel } from './util/logger';

export const config = readConfig('D:/hyperbot-town-irc/config/bot.conf');
export const bundle = readBundle('D:/hyperbot-town-irc/config/bundle.conf');

export const noPingStore = new Store('noping');
export const lastSeenStore = new Store('lastseen');

async function start() {
  Logger.level = LogLevel.Debug;

  await Shell.start();
  const bot = new Bot(config, bundle);
  const cli = new Cli(bot);
  const dashboard = new Dashboard(bot);

  dashboard.listen();

  process.on('uncaughtException', (error, origin) => {
    Logger.error('process', `Uncaught exception has occurred: ${error.name}: ${error.message} (from ${origin})\n${error.stack}`);
    bot.client.client.say(config.errors.notifications, 'uncaught exception occurred');
  });

  setInterval(() => bot.client.client.say('#bots', '!water hyper'), 1 * 24 * 60 * 60 * 1000);
}

start();

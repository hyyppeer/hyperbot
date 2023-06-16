import { Bot } from './bot/bot';
import { Cli } from './bot/services/cli';
import { Dashboard } from './bot/services/dashboard/dashboard';
import { Shell } from './bot/services/town/shell';
import { readBundle, readConfig } from './util/config';
import { Logger } from './util/logger';

export const config = readConfig('D:/hyperbot-town-irc/config/bot.conf');
export const bundle = readBundle('D:/hyperbot-town-irc/config/bundle.conf');

async function start() {
  await Shell.start();
  const bot = new Bot(config, bundle);
  const cli = new Cli(bot);
  const dashboard = new Dashboard(bot);

  dashboard.listen();

  process.on('uncaughtException', (error, origin) => {
    Logger.error('uncaught exceptions', `${error.name}: ${error.message} (from ${origin})\n${error.stack}`);
    bot.client.client.say(config.errors.notifications, 'uncaught exception occurred');
  });
}

start();

import { Bot } from '../../bot';
import express, { Express } from 'express';
import { config } from '../../../index';
import { Logger } from '../../../util/logger';

export class Dashboard {
  bot: Bot;
  app: Express;
  constructor(bot: Bot) {
    this.bot = bot;
    this.app = express();
    this.app.use(express.static(config.dashboard.pubdir));
  }

  listen() {
    this.app.listen(8080, () => {
      Logger.info('dashboard', `Dashboard listening, serving ${config.dashboard.pubdir}`);
    });
  }
}

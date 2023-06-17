import { Bot, Rank } from '../../bot';
import express, { Express } from 'express';
import { config } from '../../../index';
import { Logger } from '../../../util/logger';
import chalk from 'chalk';
import { handle } from '../../modules/modules';
import bodyparser from 'body-parser';

export class Dashboard {
  bot: Bot;
  app: Express;
  constructor(bot: Bot) {
    this.bot = bot;
    this.app = express();
    this.app.use(express.static(config.dashboard.pubdir));
    this.app.use(bodyparser.json());

    this.app.post('/api/eval', async (req, res) => {
      handle(req.body.nick || 'dashboard-svc', req.body.channel || Object.keys(bot.client.client.chans)[0], `-eval ${req.body.script}`, bot, req.body.prefix || '-', req.body.rank || Rank.Owner);
      res.end('01 DOING');
    });
  }

  listen() {
    this.app.listen(8080, () => {
      Logger.info('dashboard', `Dashboard listening, serving ${chalk.grey(config.dashboard.pubdir)}`);
    });
  }
}

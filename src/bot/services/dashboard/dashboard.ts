import { Bot, Rank } from '../../bot';
import express, { Express } from 'express';
import { config } from '../../../index';
import { Logger } from '../../../util/logger';
import chalk from 'chalk';
import { handle } from '../../modules/modules';
import bodyparser from 'body-parser';
import { Extension } from '../../../util/ext';
import { readFileSync } from 'fs';

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

    this.app.post('/api/extensionrun', (req, res) => {
      Extension.execute(req.body.source, bot, {
        arg: '',
        args: [''],
        async ask(question) {
          res.write('QUESTION ' + question);
          return new Promise((resolve) => resolve('non'));
        },
        bot,
        channel: '__DASHBOARD_SERVICE',
        async confirm(confirmation) {
          return (await this.ask(confirmation || 'Are you sure?')).startsWith('y');
        },
        op: Rank.Owner,
        respond(text, pm, silent) {
          res.write(`RESPONDS ${pm} ${silent} ${text}`);
        },
        responseLoc: '__DASHBOARD_SERVICE',
        runner: 'DASHBOARD',
        todo() {
          res.write('TODO');
        },
        user: 'hyper',
      });
      res.end('\n\n\nEND 00 EXECUTED');
    });

    this.app.get('/assets/declarations', (req, res) => {
      const data = readFileSync(`${config.dashboard.declarationDir}${req.query.path}`).toString('utf8');
      res.end(data);
    });
  }

  listen() {
    this.app.listen(8080, () => {
      Logger.info('dashboard', `Dashboard listening, serving ${chalk.grey(config.dashboard.pubdir)}`);
    });
  }
}

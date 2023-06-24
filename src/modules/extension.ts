import { readFileSync } from 'fs';
import { Rank } from '../bot/bot';
import { Extension } from '../util/ext';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';
import { config } from '..';

export const extension: Module = defineModule('extension', [
  defineCommand(
    'load-ext',
    '<ext-path>',
    'loads a specified extension from the ext dir',
    (cmd) => {
      Extension.execute(readFileSync(`${config.extensions.root}/${cmd.arg}`, 'utf8'), cmd.bot, cmd);
    },
    Rank.Owner
  ),
  defineCommand(
    'run-ext',
    '<source>',
    'runs an extension from its source',
    (cmd) => {
      if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

      cmd.respond(`< ${Extension.execute(cmd.arg, cmd.bot, cmd)}`);
    },
    Rank.Owner
  ),
]);

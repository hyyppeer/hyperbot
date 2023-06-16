import { Rank } from '../bot';
import { defineCommand, defineModule, Module } from './modules';

export const moderation: Module = defineModule('moderation', {
  op: defineCommand(
    'op',
    'op <nick>',
    'ops a nick for the duration of their session',
    (cmd) => {
      if (cmd.assert(cmd.args.length > 1, 'Must provide a nick to op and a rank (owner = 3, admin = 2, mod = 1, user = 0).')) return;
      if (Number.isNaN(Number.parseInt(cmd.args[1]))) {
        cmd.fail('not a valid number');
        return;
      }
      cmd.bot.op(cmd.args[0], Number.parseInt(cmd.args[1]));
      cmd.respond('Successfully oped user');
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  deop: defineCommand(
    'deop',
    'deop <nick>',
    'deops a nick',
    (cmd) => {
      if (cmd.assert(cmd.args.length > 0, 'Must provide a nick to deop.')) return;
      cmd.bot.deop(cmd.args[0]);
      cmd.respond('Successfully deoped user');
    },
    (cmd) => cmd.op === Rank.Owner
  ),
});

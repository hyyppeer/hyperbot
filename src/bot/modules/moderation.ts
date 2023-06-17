import { Rank } from '../bot';
import { defineCommand, defineModule, Module } from './modules';

export const moderation: Module = defineModule('moderation', {
  op: defineCommand(
    'op',
    'op <nick> <rank>',
    'ops a nick for the duration of their session',
    (cmd) => {
      if (cmd.assert(cmd.args.length > 1, 'Must provide a nick to op and a rank (owner = 3, admin = 2, mod = 1, user = 0).')) return;
      if (Number.isNaN(Number.parseInt(cmd.args[1]))) {
        cmd.fail('not a valid number');
        return;
      }
      cmd.bot.op(cmd.args[0], Number.parseInt(cmd.args[1]));
      cmd.respond("Successfully op'ed user");
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  deop: defineCommand(
    'deop',
    'deop <nick>',
    'deops a nick',
    (cmd) => {
      if (cmd.assert(cmd.args.length > 0, 'Must provide a nick to de-op.')) return;
      cmd.bot.deop(cmd.args[0]);
      cmd.respond('Successfully de-oped user');
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  chanop: defineCommand('chanop', 'chanop <nick> <rank> [<channel>]', 'chanops a nick in a specific channel (current by default) for the duration of their session', (cmd) => {
    if (cmd.assert(cmd.args.length > 1, 'You must provide a nick to chanop and a rank')) return;
    if (Number.isNaN(Number.parseInt(cmd.args[1]))) {
      cmd.fail('invalid rank');
      return;
    }

    cmd.bot.chanop(cmd.args[0], Number.parseInt(cmd.args[1]), cmd.args[2] || cmd.channel);
    cmd.respond("Successfully chanop'ed user");
  }),
  dechanop: defineCommand('dechanop', 'dechanop <nick> [<channel>]', 'dechanops a nick in a specific channel (current by default) for the duration of their session', (cmd) => {
    if (cmd.assert(cmd.args.length > 1, 'You must provide a nick to dechanop')) return;

    cmd.bot.dechanop(cmd.args[0], cmd.args[1] || cmd.channel);
    cmd.respond("Successfully dechanop'ed user");
  }),
});

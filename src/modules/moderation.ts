import { Rank } from '../bot/bot';
import { CommandErrorId, defineCommand, defineModule, Module } from './modules';

export const moderation: Module = defineModule('moderation', [
  defineCommand(
    'op',
    '<nick> <rank>',
    'ops a nick for the duration of their session',
    (cmd) => {
      if (cmd.args.length < 2) throw CommandErrorId.NotEnoughArguments;
      if (Number.isNaN(Number.parseInt(cmd.args[1]))) {
        throw CommandErrorId.InvalidArguments;
      }
      cmd.bot.op(cmd.args[0], Number.parseInt(cmd.args[1]));
      cmd.respond("Successfully op'ed user");
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  defineCommand(
    'deop',
    '<nick>',
    'deops a nick',
    (cmd) => {
      if (cmd.args.length < 1) throw CommandErrorId.NotEnoughArguments;
      cmd.bot.deop(cmd.args[0]);
      cmd.respond('Successfully de-oped user');
    },
    (cmd) => cmd.op === Rank.Owner
  ),
  defineCommand('chanop', '<nick> <rank> [<channel>]', 'chanops a nick in a specific channel (current by default) for the duration of their session', (cmd) => {
    if (cmd.args.length < 2) throw CommandErrorId.NotEnoughArguments;
    if (Number.isNaN(Number.parseInt(cmd.args[1]))) {
      throw CommandErrorId.InvalidArguments;
    }

    cmd.bot.chanop(cmd.args[0], Number.parseInt(cmd.args[1]), cmd.args[2] || cmd.channel);
    cmd.respond("Successfully chanop'ed user");
  }),
  defineCommand('dechanop', '<nick> [<channel>]', 'dechanops a nick in a specific channel (current by default) for the duration of their session', (cmd) => {
    if (cmd.args.length < 1) throw CommandErrorId.NotEnoughArguments;

    cmd.bot.dechanop(cmd.args[0], cmd.args[1] || cmd.channel);
    cmd.respond("Successfully dechanop'ed user");
  }),
]);

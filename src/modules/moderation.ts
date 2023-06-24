import { Rank } from '../bot/bot';
import { CommandErrorId, defineCommand, defineModule, Module } from './modules';

export const moderation: Module = defineModule('moderation', [
  defineCommand(
    'op',
    '<nick> <rank>',
    'ops a nick for the duration of their session',
    (cmd) => {
      if (cmd.args.length < 2) throw CommandErrorId.NotEnoughArguments;
      const rank = Number.parseInt(cmd.args[1]);
      if (Number.isNaN(rank) || rank > Rank.Owner || rank < Rank.User) {
        throw CommandErrorId.InvalidArguments;
      }
      cmd.bot.op(cmd.args[0], rank);
      cmd.respond("Successfully op'ed user");
    },
    Rank.Owner
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
    Rank.Owner
  ),
  defineCommand(
    'chanop',
    '<nick> <rank> [<channel>]',
    'chanops a nick in a specific channel (current by default) for the duration of their session',
    (cmd) => {
      if (cmd.args.length < 2) throw CommandErrorId.NotEnoughArguments;
      const rank = Number.parseInt(cmd.args[1]);
      if (Number.isNaN(rank) || rank > Rank.Owner || rank < Rank.User) {
        throw CommandErrorId.InvalidArguments;
      }

      cmd.bot.chanop(cmd.args[0], rank, cmd.args[2] || cmd.channel);
      cmd.respond("Successfully chanop'ed user");
    },
    Rank.Owner
  ),
  defineCommand(
    'dechanop',
    '<nick> [<channel>]',
    'dechanops a nick in a specific channel (current by default) for the duration of their session',
    (cmd) => {
      if (cmd.args.length < 1) throw CommandErrorId.NotEnoughArguments;

      cmd.bot.dechanop(cmd.args[0], cmd.args[1] || cmd.channel);
      cmd.respond("Successfully dechanop'ed user");
    },
    Rank.Owner
  ),
  defineCommand(
    'psa',
    '<announcement>',
    'sends a message to all channels the bot is in',
    (cmd) => {
      cmd.bot.psa(cmd.arg);
    },
    Rank.Owner
  ),
]);

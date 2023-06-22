import { Reminder } from '../bot/services/reminders';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';

export const reminders: Module = defineModule('reminders', [
  defineCommand('remindme', '<duration (mins)> <text>', 'reminds you of something', (cmd) => {
    if (cmd.args.length < 2) throw CommandErrorId.NotEnoughArguments;
    const duration = Number.parseFloat(cmd.args[0]);
    if (Number.isNaN(duration)) {
      throw CommandErrorId.InvalidArguments;
    }

    const due = Date.now() + duration * 60 * 1000;
    Reminder.add(cmd.runner, due, cmd.args.slice(1).join(' '), cmd.bot);
    cmd.respond('Your reminder has been added!');
  }),
]);

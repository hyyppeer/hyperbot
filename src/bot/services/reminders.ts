import { reminderStore } from '../..';
import { Bot } from '../bot';

interface ReminderEntry {
  due: number;
  text: string;
  for: string;
}

export class Reminder {
  static reminders: ReminderEntry[] = [];
  static init(bot: Bot) {
    this.reminders = JSON.parse(reminderStore.get('reminders') || '[]');
    this.reminders.forEach((entry) => {
      this.listen(entry, bot);
    });
  }

  static add(nick: string, due: number, text: string, bot: Bot) {
    const entry = {
      for: nick,
      text,
      due,
    };

    this.reminders.push(entry);
    this.listen(entry, bot);
    this.save();
  }

  private static listen(entry: ReminderEntry, bot: Bot) {
    setTimeout(() => {
      const lateness = (Date.now() - entry.due) / 1000;
      const lateword = lateness > 0 ? 'late' : 'early';

      this.reminders.splice(this.reminders.indexOf(entry), 1);
      bot.client.client.say(entry.for, `Your reminder "${entry.text}" is due (${lateword} ${Math.abs(lateness)}s)`);
      this.save();
    }, entry.due - Date.now());
  }

  private static save() {
    reminderStore.set('reminders', JSON.stringify(this.reminders));
  }
}

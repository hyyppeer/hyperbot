import { reminderStore } from '../..';
import { Bot } from '../bot';
import { Client } from '../client/client';

interface ReminderEntry {
  due: number;
  text: string;
  for: string;
  network: string;
}

export class Reminder {
  static reminders: ReminderEntry[] = [];
  static init(bot: Bot) {
    this.reminders = JSON.parse(reminderStore.get('reminders') || '[]');
    bot.clients.forEach((client) => {
      client.client.on('registered', () => {
        this.reminders.forEach((entry) => {
          if (entry.network === `${client.server}:${client.port}`) this.listen(entry, client);
        });
      });
    });
  }

  static add(nick: string, due: number, text: string, client: Client) {
    const entry = {
      for: nick,
      text,
      due,
      network: `${client.server}:${client.port}`,
    };

    this.reminders.push(entry);
    this.listen(entry, client);
    this.save();
  }

  private static listen(entry: ReminderEntry, client: Client) {
    setTimeout(() => {
      const lateness = (Date.now() - entry.due) / 1000;
      const lateword = lateness > 0 ? 'late' : 'early';

      this.reminders.splice(this.reminders.indexOf(entry), 1);
      client.client.say(entry.for, `Your reminder "${entry.text}" is due (${lateword} ${Math.abs(lateness)}s)`);
      this.save();
    }, entry.due - Date.now());
  }

  private static save() {
    reminderStore.set('reminders', JSON.stringify(this.reminders));
  }
}

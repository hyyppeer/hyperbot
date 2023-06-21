import { Message } from '../bot/client/irc';
import { Module, defineModule } from './modules';

const tipsarr: string[] = `You can use -rustexec to run rust programs!
How are you?
How's everyone?
You can use -remindme to set reminders! (they persist through restarts)
This bot first started out on irc.tilde.chat and has since been rewritten 2 times!`.split('\n');

function getRandomTip(): string {
  const id = Math.floor(Math.random() * tipsarr.length);
  return `Tip #${id}: ${tipsarr[id]}`;
}

export const tips: Module = defineModule('tips', 'periodically provides tips to the channel', {}, (bot) =>
  bot.client.client.on('join', (channel, nick) => {
    if (nick !== bot.client.client.nick) return;

    setInterval(() => {
      bot.client.client.say(channel, getRandomTip());
    }, 10 * 60 * 1000);
  })
);
import { defineCommand, defineModule, Module } from './modules';
import axios from 'axios';

export const fun: Module = defineModule('fun', {
  dadjoke: defineCommand('dadjoke', '', 'get a random dad joke from icanhazdadjoke.com', (cmd) => {
    axios
      .get('https://icanhazdadjoke.com/', {
        headers: {
          Accept: 'text/plain',
        },
      })
      .then((response) => {
        cmd.respond(response.data);
      });
  }),
  '8ball': defineCommand('8ball', '', 'ask an 8ball a question', (cmd) => {
    const responses: string[] = [
      'It is certain.',
      'It is decidedly so.',
      'Without a doubt.',
      'Yes definitely.',
      'You may rely on it.',
      'As I see it, yes.',
      'Most likely.',
      'Outlook good.',
      'Yes',
      'Signs point to yes.',
      'Reply hazy, try again.',
      'Ask again later.',
      'Better not tell you now.',
      'Cannot predict now.',
      'Concentrate and ask again.',
      "Don't count on it.",
      'My reply is no.',
      'My sources say no.',
      'Outlook not so good.',
      'Very doubtful.',
    ];

    cmd.respond(responses[Math.floor(Math.random() * responses.length)]);
  }),
  dice: defineCommand('dice', '', 'roll a dice (1-6)', (cmd) => {
    const responses = '⚀⚁⚂⚃⚄⚅'.split('');

    const num = Math.floor(Math.random() * responses.length);

    cmd.respond(`${responses[num]} You rolled a ${num + 1}!`);
  }),
});

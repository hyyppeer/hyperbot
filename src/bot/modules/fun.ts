import { defineCommand, defineModule, Module } from './modules';
import axios from 'axios';

export const fun: Module = defineModule('fun', {
  dadjoke: defineCommand('dadjoke', 'dadjoke', 'get a random dad joke from icanhazdadjoke.com', (cmd) => {
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
});

import { defineCommand, defineModule, Module } from './modules';

export const fun: Module = defineModule('fun', {
  // dadjoke: defineCommand('dadjoke', 'dadjoke', 'get a random dad joke from icanhazdadjoke.com', (cmd) => {
  //   cmd.todo();
  // }),
});

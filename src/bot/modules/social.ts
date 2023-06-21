import { lastSeenStore } from '../..';
import { CommandErrorId, defineCommand, defineModule, Module } from './modules';

export const social: Module = defineModule('social', 'commands for people people', {
  lastseen: defineCommand('lastseen', 'lastseen <nick>', 'tells you the last time i saw <nick>', (cmd) => {
    if (!cmd.args[0]) throw CommandErrorId.NotEnoughArguments;

    const storeval = lastSeenStore.get(cmd.args[0]);
    if (!storeval) throw CommandErrorId.InternalFailure;
    const lastts = Number.parseInt(storeval);
    const date = new Date();
    date.setTime(lastts);

    cmd.respond(lastts > 0 ? `${date.getUTCDate()}/${date.getUTCMonth()}/${date.getUTCFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}` : `I have never seen ${cmd.args[0]}`);
  }),
});

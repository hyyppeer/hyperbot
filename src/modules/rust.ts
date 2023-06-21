import axios from 'axios';
import { Logger } from '../util/logger';
import { replaceAll } from '../util/polyfills';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';

export const rust: Module = defineModule('rust', {
  rustexec: defineCommand('rustexec', '<channel (stable/beta/nightly)> <mode (debug/release)> <code>', 'executes a rust program using play.rust-lang.org/execute', (cmd) => {
    if (cmd.args.length < 3) throw CommandErrorId.NotEnoughArguments;
    const params = {
      backtrace: false,
      channel: cmd.args[0],
      code: replaceAll(replaceAll(cmd.args.slice(2).join(' '), '\\n', '\n'), '\\t', '\t'),
      crateType: 'bin',
      edition: '2021',
      mode: cmd.args[1],
      tests: false,
    };

    axios
      .post(`https://play.rust-lang.org/execute`, JSON.stringify(params), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        cmd.respond(response.data.success ? 'Success' : 'Failure', { pm: true });
        if (response.data.stdout) cmd.respond('--- STDOUT ---', { pm: true, silent: true });
        if (response.data.stdout)
          cmd.respond(
            response.data.stdout
              .split('\n')
              .slice(0, 5)
              .map((v: string) => `> ${v}`)
              .join('\n'),
            { pm: true, silent: true }
          );
        if (response.data.stderr) cmd.respond('--- STDERR ---', { pm: true, silent: true });
        if (response.data.stderr)
          cmd.respond(
            response.data.stderr
              .split('\n')
              .slice(0, 5)
              .map((v: string) => `> ${v}`)
              .join('\n'),

            { pm: true, silent: true }
          );
      })
      .catch((reason) => {
        Logger.error('rust', reason);
      });
  }),
});

import { Extension } from '../../util/ext';
import { Rank } from '../bot';
import { Shell } from '../services/town/shell';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';

export const repl: Module = defineModule('repl', 'see help for command', {
  'start-repl': defineCommand(
    'start-repl',
    'start-repl <js/sh/ext>',
    'start a repl (js or shell or extension)',
    async (cmd) => {
      if (!cmd.args[0]) throw CommandErrorId.NotEnoughArguments;

      const run = async (src: string) => {
        const mode = cmd.args[0];
        return new Promise(async (resolve) => {
          switch (mode) {
            case 'js':
              resolve(eval(src));
              break;
            case 'sh':
              resolve(await Shell.exec(src));
              break;
            case 'ext':
              resolve(Extension.execute(src, cmd.bot, cmd));
              break;
            default:
              break;
          }
        });
      };

      while (true) {
        const answer = await cmd.ask('Enter your statement (.exit to exit the repl)');
        if (answer === '.exit') {
          break;
        }

        cmd.respond(`< ${await run(answer)}`, true, true);
      }
      cmd.respond('Exited repl successfully.');
    },
    (cmd) => cmd.op >= Rank.Owner
  ),
});

import { readFileSync, writeFileSync } from 'fs';
import { JsonCmdAction, JsonCmdActionType, JsonCmdListener, JsonCommand, JsonCommands, JsonPackage } from '../../util/jsoncmds';
import { Rank } from '../bot';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';
import { Logger } from '../../util/logger';
import { config } from '../..';
import { Shell } from '../services/town/shell';
import { randomBytes } from 'crypto';

export const packages: Module = defineModule('packages', 'packages are simple modules created by users', {
  loadpkg: defineCommand(
    'loadpkg',
    'loadpkg <pkg-name>',
    'load a package from json-pkgs',
    (cmd) => {
      if (!cmd.args[0]) throw CommandErrorId.NotEnoughArguments;
      JsonCommands.loadPackage(readFileSync(`${config.jsonpkg.rootdir}/${cmd.args[0]}`).toString('utf8'));
    },
    (cmd) => cmd.op >= Rank.Owner
  ),
  unloadpkg: defineCommand(
    'unloadpkg',
    'unloadpkg <pkg-name>',
    'unload a package from json-pkgs',
    (cmd) => {
      if (!cmd.args[0]) throw CommandErrorId.NotEnoughArguments;
      JsonCommands.unloadPackage(readFileSync(`${config.jsonpkg.rootdir}/${cmd.args[0]}`).toString('utf8'));
    },
    (cmd) => cmd.op >= Rank.Owner
  ),
  createpkg: defineCommand(
    'createpkg',
    'createpkg',
    'create a package, you will be asked to enter info about it',
    async (cmd) => {
      if (cmd.channel.startsWith('#')) throw 'Sorry, createpkg is only allowed in PMs to prevent spam.';
      cmd.respond('Please note: only ASCII characters are allowed in these fields');
      const name = await cmd.ask('What would you like to name your package?');
      const help = await cmd.ask('Please enter a help string for your package.');
      let commands: JsonCommand[] = [];

      while (true) {
        if (!(await cmd.confirm('Would you like to add a command? (y/N)'))) {
          break;
        }

        const name = await cmd.ask('What would you like to name this command?');
        const syntax = await cmd.ask('What is the syntax to use this command?');
        const help = await cmd.ask('What is the help for this command?');
        const rank = Number.parseInt(await cmd.ask('What is the minimum rank to use this command? (1-3)'));
        const listeners: JsonCmdListener[] = [];
        while (true) {
          if (!(await cmd.confirm('Would you like to add a listener? (y/N)'))) {
            break;
          }

          const onans = await cmd.ask('When would you like this command to be triggered? (ran)');
          const on = onans === 'ran' ? onans : 'ran';

          const actions: JsonCmdAction[] = [];
          while (true) {
            if (!(await cmd.confirm('Would you like to add an action? (y/N)'))) {
              break;
            }

            const typea = await cmd.ask('What is the type of this action? (say/do)');
            const type: JsonCmdActionType = typea === 'do' ? typea : 'say';

            const argarr: string[] = [];
            while (true) {
              if (!(await cmd.confirm('Would you like to add an argument? (y/N)'))) {
                break;
              }

              const arg = await cmd.ask('Please enter the argument.');
              argarr.push(arg);
            }
            actions.push({
              type,
              args: argarr,
            });
          }
          listeners.push({
            on,
            actions,
          });
        }
        commands.push({
          help,
          listeners,
          syntax,
          name,
          rankRequired: rank,
        });
      }

      const pkg: JsonPackage = {
        name,
        help,
        commands,
      };

      const pkgstr = JsonCommands.createPackage(pkg);
      const json = JsonCommands.decompress(pkgstr);
      const pkgid = randomBytes(8).toString('hex');

      await Shell.exec(`echo ${pkgstr} > /home/hyper/hyperbot/pkgs/${pkgid}`);
      cmd.respond(`Your package has been stored in /home/hyper/hyperbot/pkgs/${pkgid}`);
      cmd.respond('Load it using the loadpkgstr command');
      const submit = await cmd.confirm('Would you like to submit this package to be reviewed and potentially added to the bot?');

      if (submit) {
        writeFileSync(`${config.jsonpkg.submissionrootdir}/submit-${pkgid}.pkg`, pkgstr);
        writeFileSync(`${config.jsonpkg.submissionrootdir}/submit-${pkgid}.json`, json);
        cmd.respond('Submitted!');
        Logger.info('package', `Submitted package ${pkgid} for review in ${config.jsonpkg.submissionrootdir}`);
      } else cmd.respond('Your package has not been submitted');
    },
    (cmd) => cmd.op >= Rank.Admin
  ),
  loadpkgstr: defineCommand(
    'loadpkgstr',
    'loadpkgstr <pkgstr>',
    'loads a package from its pkgstr',
    (cmd) => {
      if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

      JsonCommands.loadPackage(cmd.arg);
    },
    (cmd) => cmd.op >= Rank.Owner
  ),
  unloadpkgstr: defineCommand('unloadpkgstr', 'unloadpkgstr <pkgstr>', 'unloads a package from its package string', (cmd) => {
    if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

    JsonCommands.unloadPackage(cmd.arg);
  }),
});

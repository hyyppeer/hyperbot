import { writeFileSync } from 'fs';
import { JsonCmdAction, JsonCmdActionType, JsonCmdListener, JsonCommand, JsonCommands, JsonPackage } from '../util/jsoncmds';
import { Rank } from '../bot/bot';
import { CommandErrorId, Module, defineCommand, defineModule } from './modules';
import { Logger } from '../util/logger';
import { config } from '..';
import { Shell } from '../bot/services/town/shell';
import { randomBytes } from 'crypto';
import { HyperPackageManager } from '../util/hpm';

export const packages: Module = defineModule('packages', [
  defineCommand(
    'createpkg',
    '',
    'create a package, you will be asked to enter info about it',
    async (cmd) => {
      const fail = () => {
        throw 'timeout';
      };
      if (cmd.channel.startsWith('#')) throw 'Sorry, createpkg is only allowed in PMs to prevent spam.';
      cmd.respond('Please note: only ASCII characters are allowed in these fields');
      const name = await cmd.ask('What would you like to name your package?', fail);
      let commands: JsonCommand[] = [];

      while (true) {
        if (!(await cmd.confirm('Would you like to add a command? (y/N)'))) {
          break;
        }

        const name = await cmd.ask('What would you like to name this command?', fail);
        const syntax = await cmd.ask('What is the syntax to use this command?', fail);
        const help = await cmd.ask('What is the help for this command?', fail);
        const rank = Number.parseInt(await cmd.ask('What is the minimum rank to use this command? (1-3)', fail));
        const listeners: JsonCmdListener[] = [];
        while (true) {
          if (!(await cmd.confirm('Would you like to add a listener? (y/N)'))) {
            break;
          }

          const onans = await cmd.ask('When would you like this command to be triggered? (ran)', fail);
          const on = onans === 'ran' ? onans : 'ran';

          const actions: JsonCmdAction[] = [];
          while (true) {
            if (!(await cmd.confirm('Would you like to add an action? (y/N)'))) {
              break;
            }

            const typea = await cmd.ask('What is the type of this action? (say/do)', fail);
            const type: JsonCmdActionType = typea === 'do' ? typea : 'say';

            const argarr: string[] = [];
            while (true) {
              if (!(await cmd.confirm('Would you like to add an argument? (y/N)'))) {
                break;
              }

              const arg = await cmd.ask('Please enter the argument.', fail);
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
        commands,
      };

      const pkgstr = JsonCommands.createPackage(pkg);
      const json = JsonCommands.decompress(pkgstr);
      const pkgid = randomBytes(8).toString('hex');

      await Shell.exec(`echo ${pkgstr} > /home/hyper/hyperbot/pkgs/${pkgid}`);
      cmd.respond(`Your package has been stored in /home/hyper/hyperbot/pkgs/${pkgid}`);
      cmd.respond('Load it using the loadpkgstr command');
      const submit = await cmd.confirm('Would you like to submit this package to be reviewed and potentially added to the bot?');
      const hpmSubmit = await cmd.confirm('Would you like to submit this package to HPM (hyper package manager)');

      if (submit) {
        writeFileSync(`${config.jsonpkg.submissionrootdir}/submit-${pkgid}.pkg`, pkgstr);
        writeFileSync(`${config.jsonpkg.submissionrootdir}/submit-${pkgid}.json`, json);
        cmd.respond('Submitted!');
        Logger.info('package', `Submitted package ${pkgid} for review in ${config.jsonpkg.submissionrootdir}`);
      } else cmd.respond('Your package has not been submitted');
      if (hpmSubmit) {
        const user = await cmd.identify();
        const name = await cmd.ask('Please enter a name for your HPM package', () => {
          throw 'Your package has not been submitted to HPM';
        });
        HyperPackageManager.add(`~${user}/${name}`, pkgstr);
        cmd.respond('Submitted to HPM!');
      } else cmd.respond('Your package has not been submitted to HPM');
    },
    Rank.Admin
  ),
  defineCommand(
    'loadpkgstr',
    '<pkgstr>',
    'loads a package from its pkgstr',
    (cmd) => {
      if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

      JsonCommands.loadPackage(cmd.arg);
      cmd.respond('The package should be now loaded!');
    },
    Rank.Owner
  ),
  defineCommand(
    'unloadpkgstr',
    '<pkgstr>',
    'unloads a package from its package string',
    (cmd) => {
      if (!cmd.arg) throw CommandErrorId.NotEnoughArguments;

      JsonCommands.unloadPackage(cmd.arg);
      cmd.respond('The package should be now unloaded!');
    },
    Rank.Owner
  ),
  defineCommand(
    'hpm-load',
    '<package-path>',
    'loads a package from hyper package manager',
    (cmd) => {
      if (!cmd.arg) throw 'No path provided!';
      const pkg = HyperPackageManager.get(cmd.arg);
      if (!pkg) throw "Sorry, that package doesn't exist";

      JsonCommands.loadPackage(pkg);
      cmd.respond('Success!');
    },
    Rank.Owner
  ),
  defineCommand(
    'hpm-unload',
    '<package-path>',
    'unloads a package from hyper package manager',
    (cmd) => {
      if (!cmd.arg) throw 'No path provided!';
      const pkg = HyperPackageManager.get(cmd.arg);
      if (!pkg) throw "Sorry, that package doesn't exist";

      JsonCommands.unloadPackage(pkg);
      cmd.respond('Success!');
    },
    Rank.Owner
  ),
]);

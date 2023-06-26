import { Botany } from '../util/botany';
import { Module, defineCommand, defineModule } from './modules';

export const botany: Module = defineModule('botany', [
  defineCommand('water', '[<user>]', 'waters a users plant, yours by default', async (cmd) => {
    const plant = new Botany(cmd.args[0] || (await cmd.identify()));
    await plant.read();
    await plant.water(`${await cmd.identify()}, through hyperbot`);
    cmd.client.client.action(cmd.channel, `waters ${cmd.args[0] || (await cmd.identify())}'s plant`);
  }),
]);

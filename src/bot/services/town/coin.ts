import { Shell } from './shell';

export class Coin {
  static coinname: string = 'Hyperbot';
  static async balance(): Promise<number> {
    return Number.parseFloat(await this.run('balance'));
  }

  private static async run(command: string) {
    return (await Shell.exec(`~jmjl/bin/coin ${this.coinname} ${command}`))[0];
  }
}

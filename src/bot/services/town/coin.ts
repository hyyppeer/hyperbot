import { Shell } from './shell';

export class Coin {
  static coinname: string = 'Hyperbot';
  static async balance(): Promise<number> {
    return Number.parseFloat((await Shell.exec(`/home/jmjl/bin/coin ${this.coinname} balance`))[0]);
  }
}

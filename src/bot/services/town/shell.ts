import { Logger } from '../../../util/logger';
import { Client as Ssh } from 'ssh2';
import { readFileSync } from 'fs';
import { config } from '../../../index';

export class Shell {
  static ssh: Ssh;
  static done: boolean = false;
  static async start(): Promise<void> {
    if (this.done) return;
    return new Promise((resolve) => {
      Logger.info('shell', 'setting up shell');
      this.done = true;
      this.ssh = new Ssh();
      this.ssh
        .on('ready', () => {
          Logger.info('shell', 'shell is ready');
          resolve();
        })
        .connect({
          host: 'tilde.town',
          username: 'hyper',
          privateKey: readFileSync(config.shell.privatekey_path),
          port: 22,
        });
    });
  }
  static async exec(cmd: string): Promise<[string, number]> {
    return new Promise((resolve) => {
      this.ssh.exec(cmd, {}, (err, stream) => {
        if (err) {
          Logger.error('shell', `local exec err: ${err}`);
          return;
        }
        let data = '';
        stream
          .on('close', (code: number) => {
            resolve([data, code]);
          })
          .on('data', (dat: string) => (data += dat))
          .stderr.on('data', (chnk) => Logger.warn('shell', `remote exec err: ${chnk}`));
      });
    });
  }
}

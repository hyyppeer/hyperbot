import { hpmStore } from '..';

export class HyperPackageManager {
  static get(path: string): string | null {
    return hpmStore.get(path);
  }
  static add(path: string, content: string) {
    hpmStore.set(path, content);
  }
  static remove(path: string) {
    hpmStore.set(path, '');
  }
}

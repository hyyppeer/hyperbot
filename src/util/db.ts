import { readFileSync, writeFileSync } from 'fs';
import { config } from '..';

export class Store {
  private path: string;
  private data: Record<any, any>;
  constructor(name: string) {
    this.path = config.stores[name];
    this.data = JSON.parse(readFileSync(this.path).toString() || '{}');
  }

  get(key: string): string | null {
    return this.data[key];
  }
  set(key: string, value: string) {
    this.data[key] = value;
    this.save();
  }

  save() {
    writeFileSync(this.path, JSON.stringify(this.data));
  }

  get object() {
    return this.data;
  }
}

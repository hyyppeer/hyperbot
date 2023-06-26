import { readFileSync, promises as fs } from 'fs';
import { config } from '..';

async function save() {
  fs.writeFile(config.userdata.path, JSON.stringify(data));
}

let data: Record<string, any> = {};
export const load = () => (data = JSON.parse(readFileSync(config.userdata.path, 'utf-8')));

export function getUserData(user: string): Record<string, any> {
  if (!data[user]) {
    data[user] = {};
    save();
  }
  return data[user];
}
export function setUserData(user: string, name: string, value: any) {
  if (!data[user]) {
    data[user] = {};
  }
  data[user][name] = value;
  save();
}

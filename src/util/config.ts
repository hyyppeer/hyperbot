import { readFileSync } from 'fs';

export interface Config {
  [namespace: string]: Record<string, any>;
}

export type Bundle = Record<string, (...args: any[]) => any>;

function parseVal(str: string): any {
  if (!str) return;

  if (str === 'false') {
    return false;
  } else if (str === 'true') {
    return true;
  } else if (str.startsWith('fn ')) {
    return eval(str.substring(3));
  } else if (str.startsWith('"')) {
    return str.substring(1, str.length - 1);
  } else if (str.startsWith('[') || str.startsWith('{')) {
    return JSON.parse(str);
  } else {
    try {
      return Number.parseFloat(str);
    } catch (e) {}
  }
}

export function readConfig(path: string): Config {
  const data = readFileSync(path).toString('utf-8');
  let config: Config = {};
  let namespace = 'main';

  for (const line of data.split('\n')) {
    const trimmed = line.trim();

    if (trimmed.startsWith(';')) continue;

    if (trimmed.startsWith('.')) {
      namespace = trimmed.substring(1);
    } else {
      let split = trimmed.split('=');
      split = [split[0], split.slice(1).join('=')];
      split = split.map((v) => v.trim());

      if (!config[namespace]) config[namespace] = {};
      config[namespace][split[0]] = parseVal(split[1] || '');
    }
  }

  return config;
}

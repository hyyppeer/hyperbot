import { Shell } from '../bot/services/town/shell';
import { replaceAll } from './polyfills';

interface Visitor {
  timestamp: number;
  user: string;
}

interface PlantData {
  owner: string;
  description: string;
  age: string;
  score: number;
  is_dead: boolean;
  last_watered: number;
  file_name: string;
  stage: string;
  generation: number;
  species: string;
}

export class Botany {
  private visitorsPath: string;
  private dataPath: string;
  private visitors?: Visitor[];
  private data?: PlantData;
  constructor(user: string) {
    this.visitorsPath = `~${user}/.botany/visitors.json`;
    this.dataPath = `~${user}/.botany/${user}_plant_data.json`;
  }

  async water(user: string) {
    if (this.data) this.data.last_watered = Math.floor(Date.now() / 1000);
    this.visitors?.push({
      timestamp: Math.floor(Date.now() / 1000),
      user,
    });
    await this.save();
  }

  async read() {
    this.visitors = JSON.parse((await Shell.exec(`cat ${this.visitorsPath}`))[0]);
    this.data = JSON.parse((await Shell.exec(`cat ${this.dataPath}`))[0]);
  }
  async save() {
    await Shell.exec(`echo "${replaceAll(JSON.stringify(this.visitors, undefined, 2), '"', '\\"')}" > ${this.visitorsPath}`);
    await Shell.exec(`echo "${replaceAll(JSON.stringify(this.data, undefined, 2), '"', '\\"')}" > ${this.dataPath}`);
  }
}

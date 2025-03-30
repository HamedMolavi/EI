import { existsSync, readFileSync } from "fs";
import yaml from 'js-yaml';
import path from "path";
import { ConfigReader } from "./reader";

export class ConfigFileReader extends ConfigReader {
  path: string;
  loaded: boolean;
  config: { Hosts: any[]; Tasks: any[] };
  constructor(options: { path?: string }) {
    super();
    this.path = options?.path ?? path.join(__dirname, "../config.yml");
    this.loaded = false;
    this.config = {
      Hosts: [],
      Tasks: []
    };
  }

  load() {
    if (!existsSync(this.path)) return false;
    const configFile = readFileSync(this.path, 'utf8');
    const config = yaml.load(configFile) as { Hosts: any[], Tasks: any[] };
    const { Hosts, Tasks } = config;
    this.config.Hosts = Hosts;
    this.config.Tasks = Tasks;
    this.loaded = true;
    return true;
  }
  update() {
    return true;
  }
}

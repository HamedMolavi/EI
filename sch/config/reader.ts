export abstract class ConfigReader {
  path: string;
  loaded: boolean;
  abstract load(): boolean;
  abstract update(): boolean;

  constructor() {
    this.path = "";
    this.loaded = false;
  }

}
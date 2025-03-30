import { Config } from "../config";

export { };
declare global {
  namespace NodeJS {
    interface Process {
      conf: Config
    }
    interface ProcessEnv {
    }
  }
}

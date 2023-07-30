import path from "node:path";
import { Config } from "./lib/squery/Config";

declare module "./lib/squery/Config" {
  export interface ConfigInterface {
    PORT: number;
    tempDir?: string;
    tempDuration?: number;
  }
  export const azerty = 0; 
}

Config.conf = {
  PORT: 3500,
  tempDuration: 24 * 60 * 60 * 1000,
  URL_KEY: 'Log("<{-_-}>","\\(^_^)/")',
  TOKEN_KEY: 'Log("(-^-)","(- _-)")',
  rootDir: __dirname,
  execDir: ["/App/Models", "/App/Controllers", "/Start"],
};

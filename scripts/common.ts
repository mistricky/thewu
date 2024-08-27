import { join } from "jsr:@std/path";

export const withConfigPath = (path: string) => join(path, "package.json");

export const readPkgConfig = async (path: string) =>
  JSON.parse(await Deno.readTextFile(withConfigPath(path)));

export const writePkgConfig = (path: string, config: Record<string, unknown>) =>
  Deno.writeTextFile(withConfigPath(path), JSON.stringify(config, null, 2));

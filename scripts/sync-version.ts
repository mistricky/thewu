// This script sync version of wu packages and publish them to NPM
// Please make sure you have modified the version in the workspace package.json before running this script

import { join } from "jsr:@std/path";

const withConfigPath = (path: string) => join(path, "package.json");
const readPkgConfig = async (path: string) =>
  JSON.parse(await Deno.readTextFile(withConfigPath(path)));
const writePkgConfig = (path: string, config: Record<string, unknown>) =>
  Deno.writeTextFile(withConfigPath(path), JSON.stringify(config, null, 2));

// Read workspace package.json version
const { version } = await readPkgConfig("..");

if (!version) {
  throw new Error("Root package version not found");
}

const packagesPath = join("..", "packages");

// Sync version to all workspace packages
for await (const pkg of Deno.readDir(packagesPath)) {
  const pkgPath = join(packagesPath, pkg.name);
  const config = await readPkgConfig(pkgPath);

  // Assign new version which from root package.json
  config.version = version;

  writePkgConfig(pkgPath, config);
}

// This script sync version of wu packages and publish them to NPM
// Please make sure you have modified the version in the workspace package.json before running this script

import { join } from "jsr:@std/path";
import { readPkgConfig, writePkgConfig } from "./common.ts";

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

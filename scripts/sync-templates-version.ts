// This script sync version of templates @thewu dependencies to the root package.json
// Please make sure you have modified the version in the root package.json before running this script

import { join } from "jsr:@std/path";
import { readPkgConfig, writePkgConfig } from "./common.ts";

const NEED_UPDATE_DEPENDENCIES = {
  dependencies: ["@thewu/core", "@thewu/jsx", "@thewu/browser"],
  devDependencies: ["@thewu/config"],
};

const rootPkgPath = join("..", "package.json");
const rootPkg = JSON.parse(await Deno.readTextFile(rootPkgPath));
const templatesPath = join("..", "templates");

const withMajorVersionLocker = (version: string) => `^${version}`;

const updateDependencies = (
  dependencies: string[],
  config?: Record<string, unknown>
) => {
  const parsedConfig = config ?? {};

  for (const dep of dependencies) {
    parsedConfig[dep] = withMajorVersionLocker(rootPkg.version);
  }

  return parsedConfig;
};

const writeBackConfig = (
  pkgPath: string,
  config: Record<string, unknown>,
  dependenciesKey: "dependencies" | "devDependencies"
) => {
  const dependencies = config[dependenciesKey] as Record<string, unknown>;
  const needUpdateDependencies = NEED_UPDATE_DEPENDENCIES[dependenciesKey];

  if (!dependencies) {
    return;
  }

  const updatedDependencies = updateDependencies(
    needUpdateDependencies,
    dependencies
  );

  config[dependenciesKey] = updatedDependencies;

  writePkgConfig(pkgPath, config);
};

for await (const pkg of Deno.readDir(templatesPath)) {
  const pkgPath = join(templatesPath, pkg.name);
  const config = await readPkgConfig(pkgPath);

  writeBackConfig(pkgPath, config, "dependencies");
  writeBackConfig(pkgPath, config, "devDependencies");

  console.log(`[LOG] Updated ${pkgPath}`);
}

import { join } from "jsr:@std/path";

const publish = async (path: string) => {
  const command = new Deno.Command("pnpm", {
    cwd: path,
    args: ["publish", "--access=public"],
  });
  const { stdout, stderr } = await command.output();
  const decoder = new TextDecoder();

  if (stderr.length) {
    console.log(decoder.decode(stderr));
  }

  console.log(decoder.decode(stdout));
};

const packagesPath = join("..", "packages");

// Sync version to all workspace packages
for await (const pkg of Deno.readDir(packagesPath)) {
  const pkgPath = join(packagesPath, pkg.name);

  await publish(pkgPath);
}

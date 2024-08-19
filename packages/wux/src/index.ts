import { reactive } from "./reactive";
import { subscribe } from "./subscription";

export * from "./reactive";
export * from "./computed";
export * from "./subscription";
export * from "./dependence-manager";

const a = reactive(
  [],
  // { recursion: true, observerId: "Hello world" },
);

subscribe(() => {
  console.info(`a: ${JSON.stringify(a)}`);
});

a.push(1);

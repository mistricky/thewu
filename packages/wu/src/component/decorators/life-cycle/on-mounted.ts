import { createLifeCycleHook } from "./common";

export const { onMounted, getMountedLifeCycleHookName } = createLifeCycleHook(
  "mounted",
  Symbol("MOUNTED_METADATA_KEY"),
);

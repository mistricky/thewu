import { createLifeCycleHook } from "./common";

export const { onDestroy, getDestroyLifeCycleHookName } = createLifeCycleHook(
  "destroy",
  Symbol("DESTROY_METADATA_KEY"),
);

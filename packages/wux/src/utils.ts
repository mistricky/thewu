import { dependenceManager } from "./dependence-manager";
import { WithDependenceManager } from "./global";

export const isEmptyObject = (obj: Record<string, unknown>) =>
  !Object.keys(obj).length;

export const getDependenceManagerFromOptions = <
  T extends WithDependenceManager<{}>,
>(
  options?: T,
) => options?.dependenceManager ?? dependenceManager;

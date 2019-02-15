import { Constructor } from "./common-types";

export interface ListenerConfig {}

export function Listener() {
  return <T extends Constructor>(
    target: T,
    property: string,
    descriptor: PropertyDescriptor
  ) => {};
}

import { Constructor } from "./common-types";

export function Mixin() {
  return <T extends Constructor>(Constructor: T) => {
    return class extends Constructor {};
  };
}

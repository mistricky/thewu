import { WuNode } from "@wu/core";
import { METADATA_PROP_KEY } from "./prop";
import { METADATA_STATE_KEY } from "./state";

export interface Component {
  render(): WuNode;
}

export const Component =
  <P extends Record<string, unknown>>() =>
  <T extends { new (...args: any[]): any }>(Constructor: T) =>
    class extends Constructor {
      props: P = {} as P;

      constructor(...args: any[]) {
        super(...args);

        const [params] = args as [{ props: P }];

        this.props = params.props;

        return new Proxy(this, {
          get: (target, propertyKey) => {
            const propMapName = Reflect.getMetadata(
              METADATA_PROP_KEY,
              target,
              propertyKey,
            );

            // If the propertyKey is prop
            if (propMapName) {
              return this.props[propMapName];
            }

            return Reflect.get(target, propertyKey);
          },
          set: (target, propertyKey, value) => {
            // If the propertyKey is state
            if (Reflect.hasMetadata(METADATA_STATE_KEY, target, propertyKey)) {
              this.patch();
            }

            // If the propertyKey is prop
            if (Reflect.hasMetadata(METADATA_PROP_KEY, target, propertyKey)) {
              throw new Error("The prop is readonly.");
            }

            return Reflect.set(target, propertyKey, value);
          },
        });
      }

      patch() {
        console.info("Patching");
      }

      // render
      mountDOM() {}
    };

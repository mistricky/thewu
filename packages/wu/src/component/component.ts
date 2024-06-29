import "reflect-metadata";
import { METADATA_PROP_KEY, initializeProp, initializeProps } from "./prop";
import { METADATA_STATE_KEY } from "./state";
import { assignDefault } from "./default";
import { WuNode } from "../jsx";
import { ParsedWuNode, initializeNode } from "../initialize";
import { patch } from "../reconciliation";
import { Renderer } from "../renderer";

export interface Component {
  render(): WuNode;
  init(vdom: ParsedWuNode): void;
  mount(renderer: Renderer): void;
  destroy(): void;
}

type Props = Record<string, unknown>;

interface ComponentParams {
  props: Props;
}

export const Component =
  () =>
  <T extends { new (...args: any[]): any }>(Constructor: T) =>
    class extends Constructor {
      props: Props = {};
      vdom: ParsedWuNode | undefined;
      renderer: Renderer | undefined;

      constructor(...args: any[]) {
        super(...args);

        const [{ props }] = args as [ComponentParams];

        initializeProps(this, props);
        initializeProp(this, props);
        assignDefault(this, props);

        return new Proxy(this, {
          set: (target, propertyKey, value, receiver) => {
            // If the propertyKey is state
            if (Reflect.hasMetadata(METADATA_STATE_KEY, target, propertyKey)) {
              this.patch();
            }

            // If the propertyKey is prop
            if (Reflect.hasMetadata(METADATA_PROP_KEY, target, propertyKey)) {
              throw new Error("The prop is readonly.");
            }

            return Reflect.set(target, propertyKey, value, receiver);
          },
        });
      }

      init(vdom: ParsedWuNode) {
        this.vdom = vdom;
        this.onInit?.();
      }

      mount(renderer: Renderer) {
        this.renderer = renderer;
        this.onMounted?.();
      }

      // When the state was changed, the patch action will invoke automatically
      patch() {
        if (!this.vdom) {
          throw new Error("Cannot call patch function before render call");
        }

        if (!this.renderer) {
          throw new Error("Component mount failed");
        }

        // Move to next tick of event loop to make sure the state always be the latest
        Promise.resolve().then(() =>
          patch(
            this.vdom!,
            (this.vdom = initializeNode(this.render(), this.vdom!.parentEl)),
            this.renderer!,
          ),
        );
      }
    };

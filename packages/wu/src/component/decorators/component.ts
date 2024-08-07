import "reflect-metadata";
import { METADATA_PROP_KEY, setProp, setProps } from "./prop";
import { METADATA_STATE_KEY } from "./state";
import { assignDefault } from "./default";
import { WuNode, WuNodeProps } from "../../jsx";
import { ParsedWuNode, initializeNode } from "../../initialize";
import { patch } from "../../reconciliation";
import { Renderer } from "../../renderer";

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
      proxyInstance: any;

      constructor(...args: any[]) {
        super(...args);

        const [{ props }] = args as [ComponentParams];

        setProps(this, props);
        setProp(this, props);
        assignDefault(this, props);

        this.proxyInstance = new Proxy(this, {
          set: (target, propertyKey, value, receiver) => {
            console.info(
              `The state was changed: ${propertyKey.toString()} with value: ${value?.toString()}`,
            );

            // If the propertyKey is state
            if (Reflect.hasMetadata(METADATA_STATE_KEY, target, propertyKey)) {
              this.patch();
            }

            // If the propertyKey is prop
            if (Reflect.hasMetadata(METADATA_PROP_KEY, target, propertyKey)) {
              throw new Error("The prop is readonly.");
            }

            if (propertyKey === "$props") {
              setProps(this, value);
              setProp(this, value);
            }

            return Reflect.set(this, propertyKey, value, receiver);
          },
        });

        return this.proxyInstance;
      }

      init(vdom: ParsedWuNode) {
        if (!this.vdom) {
          this.vdom = vdom;
        }

        this.onInit?.();
      }

      // Init props and prop when rendering and constructing
      updateProps(props: WuNodeProps) {
        this.$props = props;
      }

      mount(renderer: Renderer) {
        this.renderer = renderer;
        this.onMounted?.();
      }

      render() {
        return super.render.bind(this.proxyInstance)();
      }

      // When the state was changed, the patch action will invoke automatically
      patch() {
        if (!this.vdom) {
          throw new Error("Cannot call patch function before render call");
        }

        if (!this.renderer) {
          throw new Error("Component mount failed");
        }

        let a = this.vdom!;

        console.info("Patching...");

        // Move to next tick of event loop to make sure the state always be the latest
        Promise.resolve().then(() => {
          this.vdom = initializeNode(this.render(), a!.parentEl, a?.parentNode);

          patch(a, this.vdom!, this.renderer!);
        });
      }
    };

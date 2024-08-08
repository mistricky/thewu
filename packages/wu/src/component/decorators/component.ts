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
  initVdom(vdom: ParsedWuNode): void;
  createInstance(...args: any[]): Component;
  updateProps(props: WuNodeProps): void;
  setRenderer(renderer: Renderer): void;
  [key: string]: any;
}

type Props = Record<string, unknown>;

interface ComponentParams {
  props: Props;
}

export const Component =
  () =>
  <T extends { new (...args: any[]): any }>(Constructor: T) =>
    class Component extends Constructor {
      props: Props = {};
      vdom: ParsedWuNode | undefined;
      renderer: Renderer | undefined;
      proxyInstance: any;

      static $instance: Component;

      static createInstance(...args: any[]) {
        return this.$instance ?? (this.$instance = new Component(...args));
      }

      constructor(...args: any[]) {
        super(...args);

        const [{ props }] = args as [ComponentParams];

        assignDefault(this, props);

        // for (const propertyKey of Object.keys(this)) {
        //   // If the propertyKey is state
        //   if (Reflect.hasMetadata(METADATA_STATE_KEY, this, propertyKey)) {
        //     this.propertyKey = new Proxy()
        //   }
        // }

        this.proxyInstance = new Proxy(this, {
          get: (target, propertyKey, receiver) => {
            const value = Reflect.get(target, propertyKey, receiver);

            if (
              Reflect.hasMetadata(METADATA_STATE_KEY, target, propertyKey) &&
              Array.isArray(value)
            ) {
              return new Proxy(value, {
                set: (target, propertyKey, value, receiver) => {
                  this.patch();

                  return Reflect.set(target, propertyKey, value, receiver);
                },
              });
            }

            return value;
          },
          set: (target, propertyKey, value, receiver) => {
            // If the propertyKey is state
            if (Reflect.hasMetadata(METADATA_STATE_KEY, target, propertyKey)) {
              console.info(
                `The state was changed: ${propertyKey.toString()} with value: ${value?.toString()}`,
              );
              this.patch();
            }

            // If the propertyKey is prop
            if (Reflect.hasMetadata(METADATA_PROP_KEY, target, propertyKey)) {
              throw new Error("The prop is readonly.");
            }

            return Reflect.set(this, propertyKey, value, receiver);
          },
        });

        return this.proxyInstance;
      }

      initVdom(vdom: ParsedWuNode) {
        if (!this.vdom) {
          this.vdom = vdom;
        }
      }

      // This method assign props to propertyKey which decorated by @Prop or @Props
      updateProps(props: WuNodeProps) {
        // this.$props = props;
        setProps(this, props);
        setProp(this, props);
      }

      // After first mounted, the renderer will be set to the component
      setRenderer(renderer: Renderer) {
        this.renderer = renderer;
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

        console.info("Patching...");

        // Move to next tick of event loop to make sure the state always be the latest
        Promise.resolve().then(() => {
          patch(
            this.vdom!,
            (this.vdom = initializeNode(
              this.render(),
              this.vdom!.parentEl,
              this.vdom?.parentNode,
            )),
            this.renderer!,
          );
        });
      }
    };

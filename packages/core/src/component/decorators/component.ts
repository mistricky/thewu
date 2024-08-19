import "reflect-metadata";
import { METADATA_PROP_KEY, setProp, setProps } from "./prop";
import { METADATA_STATE_KEY } from "./state";
import { assignDefault } from "./default";
import { WuNode, WuNodeProps } from "../../jsx";
import { ParsedWuNode, initializeNode } from "../../initialize";
import { patch } from "../../reconciliation";
import { Renderer } from "../../renderer";
import { stream, subscribe } from "@thewu/wux";

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

      static createInstance(params: ComponentParams) {
        const { props } = params;
        const instance =
          Component.$instance ?? (Component.$instance = new Component(params));

        assignDefault(instance, props);
        setProps(instance, props);
        setProp(instance, props);

        return instance;
      }

      constructor(...args: any[]) {
        super(...args);

        // When states was changed, trigger patch method
        (Reflect.getMetadata(METADATA_STATE_KEY, this) ?? []).forEach(
          (stateName: string) => {
            stream(
              () => {
                return JSON.stringify(this[stateName]);
              },
              () => {
                this.patch();
              },
            );
          },
        );
      }

      initVdom(vdom: ParsedWuNode) {
        if (!this.vdom) {
          this.vdom = vdom;
        }
      }

      // After first mounted, the renderer will be set to the component
      setRenderer(renderer: Renderer) {
        this.renderer = renderer;
      }

      render() {
        return super.render.bind(this)();
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

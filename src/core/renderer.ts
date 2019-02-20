import {
  _Element,
  ElementChildren,
  FlatComponentConstructor,
  Attrs,
  Component
} from "./element";
import { typeOf, Copy } from "../utils";
import { DATA_TYPE } from "./data-types";
import { PROP_KEY, CHILDREN_KEY, STATE_KEY } from "./decorators";

export interface UnknownIndex {
  [index: string]: unknown;
}

export interface VdomNode extends _Element {
  // ele: HTMLElement;
  instance?: Component;
}

export type Vdom = VdomNode;

// export interface WalkListener {}

export class Renderer {
  private tpl: HTMLTemplateElement = document.createElement("template");
  private unParseVdom: _Element | undefined;
  private vdom: Vdom | undefined;

  private dom: any;

  private updateRender(vdomNode: VdomNode, node: Component): VdomNode {
    let { instance, children } = vdomNode;

    if (instance && instance._key === node._key) {
      // vdomNode = this.execRender(vdomNode);
      let subComponents: unknown[] = [];

      for (let child of children) {
        if (typeOf(child) === DATA_TYPE.OBJECT) {
          subComponents.push(child);
        }
      }

      vdomNode = { ...vdomNode, ...instance.render() };
      let count = 0;
      let newChildren = vdomNode.children.map(child =>
        typeOf(child) === DATA_TYPE.OBJECT ? subComponents[count++] : child
      );

      vdomNode.children = newChildren as ElementChildren;
    }

    vdomNode.children &&
      (vdomNode.children = vdomNode.children.map(child =>
        this.updateRender(child as VdomNode, node)
      ));

    return vdomNode;
  }

  // effect function
  private update(node: Component) {
    let vdom = { ...this.vdom } as VdomNode;

    if (!vdom) {
      return;
    }

    let parsedVdom = this.updateRender(vdom, node);

    this.flush(this.dom, this.parseVDomToElement(parsedVdom));
  }

  private execChildren(children: ElementChildren): ElementChildren {
    return children.map(child =>
      typeOf(child) === DATA_TYPE.OBJECT
        ? this.execRender(child as _Element)
        : child
    );
  }

  private execRender(node: _Element): VdomNode {
    let { tagName, children, attrs } = node;
    let vdomNode: VdomNode = {
      tagName,
      attrs,
      children
    };

    if (
      typeOf(tagName) === DATA_TYPE.OBJECT ||
      typeOf(tagName) === DATA_TYPE.FUNCTION
    ) {
      let component = tagName as FlatComponentConstructor;

      component = this.injectProps(component, attrs);
      component = this.injectChildren(component, children);
      component = this.parseStateToReactive(component);

      let instance = new component();

      instance.componentWillMount();
      vdomNode = {
        ...instance.render()
      };
      vdomNode.instance = instance;

      vdomNode.children = this.execChildren(vdomNode.children);
      instance.componentDidMount();
      instance._sysDidMount();

      return vdomNode;
    }

    vdomNode.children = this.execChildren(vdomNode.children);

    return vdomNode;
  }

  private injectProperty(
    component: FlatComponentConstructor,
    metadataKey: Symbol,
    property: Attrs | ElementChildren | undefined,
    isIterable: boolean = true
  ) {
    let data = Reflect.getMetadata(metadataKey, component.prototype);

    if (!data) return component;

    let result = class extends component {
      constructor() {
        super();

        let self: UnknownIndex = this;

        if (!property) {
          return;
        }

        if (isIterable) {
          for (let prop of data) {
            self[prop] = (property as Attrs)[prop];
          }
        } else {
          self[data] = property;
        }
      }
    };

    if (!property) {
      let states: UnknownIndex = {};
      let isState = (prop: string | number) =>
        (data as (string | number | symbol)[]).includes(prop) ? true : false;
      let prototype: UnknownIndex = result.prototype;

      for (let state of data) {
        states[state] = prototype[state];
      }

      prototype["$states"] = Object.assign({}, states);

      let self = this;
      prototype = new Proxy(prototype as object, {
        set(target: UnknownIndex, prop: string | number, value: any) {
          // 防止重复渲染
          // 过滤掉 state
          if (isState(prop)) {
            // immutable
            let oldStates = target["$states"] as UnknownIndex;
            let newStates = Object.assign({}, oldStates, {
              [prop]: value
            });

            target["$states"] = newStates;

            if (target.isPropertyInit) {
              self.update(target as Component);
            }
          }

          return Reflect.set(target, prop, value);
        },
        get(target: UnknownIndex, prop: string | number) {
          if (isState(prop) && target.isPropertyInit) {
            return (target["$states"] as UnknownIndex)[prop];
          }

          return Reflect.get(target, prop);
        }
      });

      (result.prototype as object) = prototype;
    }

    return result;
  }

  private injectChildren(
    component: FlatComponentConstructor,
    children: ElementChildren
  ) {
    return this.injectProperty(component, CHILDREN_KEY, children, false);
  }

  private injectProps(component: FlatComponentConstructor, attrs: Attrs) {
    return this.injectProperty(component, PROP_KEY, attrs);
  }

  private parseStateToReactive(component: FlatComponentConstructor) {
    return this.injectProperty(component, STATE_KEY, undefined);
  }

  private parseVDomToElement(originEle: _Element): Element {
    let { tagName, attrs, children } = originEle;

    let el = document.createElement(tagName as string);

    if (attrs) {
      for (let attrName of Object.keys(attrs)) {
        el.setAttribute(attrName, attrs[attrName]);
      }
    }

    if (children) {
      // 把数组抽到扁平，提升性能
      for (let child of [].concat(...(children as any))) {
        let childEle: Text | Element | null | undefined;

        if (typeof child !== "object") {
          childEle = document.createTextNode(child);
        } else {
          childEle = this.parseVDomToElement(child as _Element);
        }

        el.appendChild(childEle);
      }
    }

    return el;
  }

  private flush(
    dom: Element,
    content: DocumentFragment | HTMLElement | Element
  ) {
    dom.innerHTML = "";
    dom.appendChild(content);
  }

  render(originEle: _Element) {
    this.unParseVdom = Copy(originEle);
    this.vdom = this.execRender(Copy(this.unParseVdom));
    this.tpl.content.appendChild(this.parseVDomToElement(this.vdom));
  }

  bindDOM(dom: Element) {
    this.dom = dom;
    this.flush(dom, document.importNode(this.tpl.content, true));
  }
}

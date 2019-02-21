import {
  _Element,
  ElementChildren,
  FlatComponentConstructor,
  Attrs,
  Component,
  ElementChild
} from "./element";
import { typeOf, Copy } from "../utils";
import { DATA_TYPE } from "./data-types";
import { PROP_KEY, CHILDREN_KEY, STATE_KEY } from "./decorators";
import { RenderQueue } from "./render-queue";

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
  private dom: Element | undefined;
  private renderQueue = new RenderQueue();

  private isPropsChange(oldAttrs: Attrs, newAttrs: Attrs): boolean {
    for (let attr of Object.keys(newAttrs)) {
      if (oldAttrs[attr] !== newAttrs[attr]) {
        return true;
      }
    }

    return false;
  }

  private updateRender(vdomNode: VdomNode): VdomNode {
    let { instance, children } = vdomNode;

    if (instance && this.renderQueue.keys.includes(instance._key)) {
      let subComponents: VdomNode[] = [];
      this.renderQueue.removeKey(instance._key);

      for (let child of children) {
        if (
          typeOf(child) === DATA_TYPE.OBJECT &&
          (child as Component).instance
        ) {
          subComponents.push(child as VdomNode);
        }
      }

      vdomNode = { ...vdomNode, ...instance.render() };
      let count = 0;
      let newChildren = vdomNode.children.map(child => {
        if (
          typeOf(child) === DATA_TYPE.OBJECT &&
          typeOf((child as Component).tagName) === DATA_TYPE.FUNCTION
        ) {
          let subComponent = subComponents[count++];
          let attrs = (child as VdomNode).attrs;

          // 对比新旧 vdom 节点的 attr
          if (
            subComponent.instance &&
            this.isPropsChange(subComponent.attrs, attrs)
          ) {
            subComponent.attrs = attrs;
            this.renderQueue.addKey(subComponent.instance._key);

            for (let attr of Object.keys(attrs)) {
              subComponent.instance[attr] = attrs[attr];
            }
          }

          return subComponent;
        } else {
          return child;
        }
      });

      vdomNode.children = newChildren as ElementChildren;
      console.info(vdomNode);
    }

    vdomNode.children &&
      (vdomNode.children = vdomNode.children.map(child =>
        this.updateRender(child as VdomNode)
      ));

    return vdomNode;
  }

  // effect function
  private update() {
    let vdom = { ...this.vdom } as VdomNode;

    if (!vdom) {
      return;
    }

    let parsedVdom = this.updateRender(vdom);

    this.flush(this.dom!, this.parseVDomToElement(parsedVdom));
  }

  private execChildren(children: ElementChildren): ElementChildren {
    return children.map(child =>
      typeOf(child) === DATA_TYPE.OBJECT
        ? this.execRender(child as _Element)
        : child
    );
  }

  private injectData(
    component: FlatComponentConstructor,
    attrs: Attrs,
    children: ElementChildren
  ): FlatComponentConstructor {
    component = this.injectProps(component, attrs);
    component = this.injectChildren(component, children);
    component = this.parseStateToReactive(component);

    return component;
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

      component = this.injectData(component, attrs, children);

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
        set(target: Component, prop: string | number, value: any) {
          // 防止重复渲染
          // 过滤掉 state
          if (isState(prop)) {
            // immutable
            let oldStates = target["$states"];
            let newStates = Object.assign({}, oldStates, {
              [prop]: value
            });

            target["$states"] = newStates;

            if (target.isPropertyInit) {
              // push in render queue
              self.renderQueue.addKey(target._key);
              self.update();
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

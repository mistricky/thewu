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
import { processLifeCircle } from "./life-circle";

export interface UnknownIndex {
  [index: string]: unknown;
}

// export interface WalkListener {}

export class Renderer {
  private tpl: HTMLTemplateElement = document.createElement("template");
  private unParseVdom: _Element | undefined;
  private instanceVdom: _Element | undefined;
  private vdom: _Element | undefined;

  private dom: any;

  // private walk(vdom: _Element) {}

  private parseVdomMountInstance(unParseVdom: _Element) {
    let { tagName, children, attrs } = unParseVdom;
    let Component = tagName as FlatComponentConstructor;

    if (typeOf(Component) === DATA_TYPE.FUNCTION) {
      Component = this.injectProps(Component, attrs);
      Component = this.injectChildren(Component, children);
      Component = this.parseStateToReactive(Component);
      unParseVdom.tagName = new (Component as FlatComponentConstructor)();
    }

    children &&
      unParseVdom.children.map(child =>
        this.parseVdomMountInstance(child as _Element)
      );

    return unParseVdom;
  }

  private updateRender(ele: _Element, node: Component): _Element {
    let { tagName: component } = ele;

    if ((component as FlatComponentConstructor)._key === node._key) {
      ele = this.execRender(ele);
    } else {
      ele.children &&
        (ele.children = ele.children.map(child =>
          this.updateRender(child as _Element, node)
        ));
    }

    return ele;
  }

  // effect function
  private update(node: Component) {
    let vdom = Copy(this.instanceVdom);

    if (!vdom) {
      return;
    }

    let parsedVdom = this.updateRender(vdom, node);

    this.flush(this.dom, this.parseVDomToElement(parsedVdom));
  }

  private execRender(instanceEle: _Element): _Element {
    let { tagName, children } = instanceEle;

    if (typeOf(tagName) === DATA_TYPE.OBJECT) {
      let component = tagName as Component;

      return this.execRender(processLifeCircle(component));
    }

    instanceEle.children = children.map(child =>
      typeOf(child) === DATA_TYPE.OBJECT
        ? this.execRender(child as _Element)
        : child
    );

    return instanceEle;
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
          if (target.isPropertyInit && isState(prop)) {
            // immutable
            let oldStates = target["$states"] as UnknownIndex;
            let newStates = Object.assign({}, oldStates, {
              [prop]: value
            });

            target["$states"] = newStates;

            self.update(target as Component);
            return true;
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
    this.instanceVdom = this.parseVdomMountInstance(Copy(this.unParseVdom));
    this.vdom = this.execRender(Copy(this.instanceVdom));
    this.tpl.content.appendChild(this.parseVDomToElement(this.vdom));
  }

  bindDOM(dom: Element) {
    this.dom = dom;
    this.flush(dom, document.importNode(this.tpl.content, true));
  }
}

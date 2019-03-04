import {
  _Element,
  ElementChildren,
  FlatComponentConstructor,
  Attrs,
  Component,
  StateType
} from "./element";
import { typeOf, Copy, mapPop } from "../utils";
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

export interface ChildrenInfo {
  propName: string;
  _key: Symbol;
}

export type Vdom = VdomNode;

// export interface WalkListener {}

export class Renderer {
  private tpl: HTMLTemplateElement = document.createElement("template");
  private unParseVdom: _Element | undefined;
  private vdom: Vdom | undefined;
  private dom: Element | undefined;
  private renderQueue = new RenderQueue();
  private childrenTable: Map<any, ChildrenInfo> = new Map();
  private a: any; // TODO：use template instead of

  private isChildrenChange(
    children: ElementChildren,
    instance: Component
  ): boolean {
    let { _key } = instance;
    let childName: any = mapPop(this.childrenTable, _key);

    if (!childName) {
      return false;
    }

    let currentChild = instance[childName];

    for (let child of children) {
      if (child !== currentChild) {
        return true;
      }
    }

    return false;
  }

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
      let _key = instance._key;

      this.renderQueue.removeKey(_key);

      for (let child of children) {
        if (
          typeOf(child) === DATA_TYPE.OBJECT &&
          (child as Component).instance
        ) {
          subComponents.push(child as VdomNode);
        }
      }

      vdomNode = { ...vdomNode, ...instance.render() };

      let deferAttrs = this.renderQueue.getAttrs(_key);
      deferAttrs && (vdomNode.attrs = deferAttrs);

      let count = 0;
      let newChildren = vdomNode.children.map(child => {
        if (
          typeOf(child) === DATA_TYPE.OBJECT &&
          typeOf((child as Component).tagName) === DATA_TYPE.FUNCTION
        ) {
          let subComponent = subComponents[count++];
          let attrs = (child as VdomNode).attrs;

          /**
           * 对比新旧 vdom 节点的 attr
           * 决定是否要 render
           */
          if (
            subComponent.instance &&
            this.isPropsChange(subComponent.attrs, attrs)
          ) {
            let _key = subComponent.instance._key;
            //set attrs defer
            this.renderQueue.setAttrs(_key, attrs);
            this.renderQueue.addKey(_key);

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

    this.vdom = this.updateRender(vdom);
    this.flush(this.dom!, this.parseVDomToElement(this.vdom));
  }

  private execChildren(children: ElementChildren): ElementChildren {
    return []
      .concat(...(children as any))
      .map(child =>
        typeOf(child) === DATA_TYPE.OBJECT ||
        typeOf(child) === DATA_TYPE.FUNCTION
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
        ...instance.render(),
        attrs,
        instance
      };

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

    let outThis = this;

    let result = class extends component {
      constructor() {
        super();

        let self: UnknownIndex = this;
        let properties = property as StateType;

        if (!property) {
          return;
        }

        if (isIterable) {
          for (let prop of data) {
            if (
              typeOf(properties[prop]) === DATA_TYPE.ARRAY ||
              typeOf(properties[prop]) === DATA_TYPE.OBJECT
            ) {
              let arr = properties[prop] as any;
              // 为了能在运行时获取到数组的名称
              arr._key = self._key;
              arr.runtimeName = prop;
              arr.belong = self;

              self[prop] = arr;
              continue;
            }

            self[prop] = properties[prop];
          }
        } else {
          outThis.childrenTable.set(properties[0], {
            _key: this._key,
            propName: data
          });
          self[data] = properties[0];
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

      prototype["$states"] = { ...states };

      let handler = {
        set: (
          target: Component & StateType,
          prop: string | number,
          value: any
        ) => {
          /**
           * TODO: runtimeName 其实是一种很脏的做法
           * 过滤掉 state， 防止重复渲染
           */
          if (isState(prop) || target.runtimeName) {
            // immutable
            let oldStates = target["$states"];
            let newStates = Object.assign({}, oldStates, {
              [prop]: value
            });

            target["$states"] = newStates;
          }

          Reflect.set(target, prop, value);

          let childInfo = this.childrenTable.get(target);

          if (
            target.runtimeName ||
            childInfo ||
            (isState(prop) && target.isPropertyInit)
          ) {
            if (target.runtimeName) {
              target.belong[target.runtimeName][prop] = value;
            }

            if (childInfo) {
              this.renderQueue.addKey(childInfo._key);
            } else {
              // push in render queue
              this.renderQueue.addKey(target._key);
            }

            this.update();
          }

          return true;
        },
        get: (target: UnknownIndex, prop: string | number): any => {
          let generateProxy = (target: any) => new Proxy(target, handler);

          if (isState(prop) && target.isPropertyInit) {
            if (typeOf(target[prop]) === DATA_TYPE.ARRAY) {
              return generateProxy(target[prop]);
            }

            if (typeOf(target[prop]) === DATA_TYPE.OBJECT) {
              return generateProxy(target[prop]);
            }

            return (target["$states"] as UnknownIndex)[prop];
          }

          return Reflect.get(target, prop);
        }
      };

      prototype = new Proxy(prototype as object, handler);

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

    let el: HTMLElement & UnknownIndex = document.createElement(
      tagName as string
    );

    if (attrs) {
      for (let attr of Object.keys(attrs)) {
        if (typeOf(attrs[attr]) === DATA_TYPE.FUNCTION) {
          el.addEventListener(attr.slice(2), attrs[attr] as any);
          continue;
        }
        el.setAttribute(attr, attrs[attr].toString());
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
    this.a = this.parseVDomToElement(this.vdom);
    // this.tpl.content.appendChild(this.parseVDomToElement(this.vdom));
  }

  bindDOM(dom: Element) {
    this.dom = dom;
    this.flush(dom, this.a);
  }
}

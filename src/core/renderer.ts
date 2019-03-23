import {
  _Element,
  ElementChildren,
  FlatComponentConstructor,
  Attrs,
  Component,
  StateType,
  ElementChild
} from './element';
import {
  typeOf,
  Copy,
  mapPop,
  ToFlatArray,
  p,
  getLayerOfVdom,
  isPropsChange
} from '../utils';
import { DATA_TYPE } from './data-types';
import { PROP_KEY, CHILDREN_KEY, STATE_KEY } from './decorators';
import { RenderQueue } from './render-queue';
import { diff } from './diff/diff';
import _ from 'lodash';
import { replace } from '../utils/dom';
import { patcher } from './diff/patcher';
import { Operation, OPERATIONS } from './diff';

export interface UnknownIndex {
  [index: string]: unknown;
}

export interface VdomNode extends _Element {
  nextSibling?: VdomNode;
  el?: HTMLElement | Node;
  instance?: Component;
  hasReRenderElement?: boolean;
}

export interface ChildrenInfo {
  propName: string;
  _key: Symbol;
}

export type Vdom = VdomNode;

interface EventNamesMap {
  [index: string]: string;
}

const EventNames: EventNamesMap = {
  change: 'input'
};

// export interface WalkListener {}

export class Renderer {
  private tpl: HTMLTemplateElement = document.createElement('template');
  private unParseVdom: _Element | undefined;
  private vdom: Vdom | undefined;
  private dom: Element | undefined;
  private renderQueue = new RenderQueue();
  private childrenTable: Map<any, ChildrenInfo> = new Map();
  // 需要重新渲染 dom 的 节点
  private elementRenderQueue: VdomNode[] = [];
  private a: any; // TODO：use template instead of

  private compare(oldVdom: VdomNode, newVdom: VdomNode) {
    if (!oldVdom && !newVdom) {
      return;
    }

    const oldEl = oldVdom.el!;
    const newEl = newVdom.el!;
    const targetChildren = newVdom.children;

    if (oldEl && newEl) {
      let oldTextContent = getTextContent(oldVdom);
      let newTextContent = getTextContent(newVdom);

      if (oldTextContent !== newTextContent) {
        oldEl.textContent = newTextContent;
        return;
      }
    }

    if (targetChildren) {
      let patchResult = diff(oldVdom.children as any, newVdom.children as any);

      patcher(patchResult as Operation<OPERATIONS, VdomNode>[]);

      targetChildren.forEach((child, index) => {
        this.compare(oldVdom.children[index] as any, child as any);
      });
    }
  }

  private updateRender(vdomNode: VdomNode): VdomNode {
    if (vdomNode === undefined) {
      return vdomNode;
    }

    let { instance, children } = vdomNode;

    if (instance && this.renderQueue.keys.includes(instance._key)) {
      let subComponents: VdomNode[] = [];
      let _key = instance._key;

      this.renderQueue.removeKey(_key);

      /**
       * 把子组件（class）添加到 subComponents 中
       * 因为重新渲染会导致渲染好的子组件丢失，导致 tagName 变为 function
       */
      for (let child of ToFlatArray(children)) {
        if (isSubComponent(child)) {
          subComponents.push(child as VdomNode);
        }
      }

      // 经过 h 出来原始的 vdom
      vdomNode = {
        ...vdomNode,
        ...instance.render()
      };

      let deferAttrs = this.renderQueue.getAttrs(_key);

      deferAttrs && (vdomNode.attrs = deferAttrs);

      // 遍历新渲染后的 children
      let count = 0;
      let newChildren = ToFlatArray(vdomNode.children).map(child => {
        let childElement = child as VdomNode;

        if (typeOf(childElement.tagName) === DATA_TYPE.FUNCTION) {
          let subComponent = subComponents[count++];
          let { attrs: newAttrs } = childElement;
          let { attrs: oldAttrs } = subComponent;

          /**
           * 对比新旧 vdom 节点的 attr
           * 决定是否要 render 以及注入 props
           */
          if (subComponent.instance && isPropsChange(oldAttrs, newAttrs)) {
            let _key = subComponent.instance._key;
            //set attrs defer
            this.renderQueue.setAttrs(_key, newAttrs);
            this.renderQueue.addKey(_key);

            // 实际注入新的值的执行逻辑
            for (let attr of Object.keys(newAttrs)) {
              subComponent.instance[attr] = newAttrs[attr];
            }
          }

          return subComponent;
        } else {
          return child;
        }
      });

      vdomNode.children = newChildren as ElementChildren;
      vdomNode.hasReRenderElement = true;
    }

    vdomNode.children &&
      (vdomNode.children = vdomNode.children.map((child, index) =>
        this.updateRender(child as VdomNode)
      ));

    return vdomNode;
  }

  // effect function
  private update() {
    let vdom = this.vdom;

    if (!vdom) {
      return;
    }

    let newVdom = this.updateRender(_.cloneDeep(vdom));

    this.parseVDomToElement(newVdom, true);
    this.vdom = newVdom;
    this.compare(vdom, newVdom);
  }

  private execChildren(children: ElementChildren): ElementChildren {
    return ToFlatArray(children).map(child =>
      typeOf(child) === DATA_TYPE.OBJECT || typeOf(child) === DATA_TYPE.FUNCTION
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

      prototype['$states'] = { ...states };

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
            let oldStates = target['$states'];
            let newStates = Object.assign({}, oldStates, {
              [prop]: value
            });

            target['$states'] = newStates;
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

            return (target['$states'] as UnknownIndex)[prop];
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

  private parseVDomToElement(
    originEle: VdomNode,
    hasReRender: boolean = false
  ): Element | Node {
    const { tagName, attrs, children } = originEle;
    const el: HTMLElement & UnknownIndex = document.createElement(
      tagName as string
    );

    if (attrs) {
      for (let attr of Object.keys(attrs)) {
        if (typeOf(attrs[attr]) === DATA_TYPE.FUNCTION) {
          const handler = attrs[attr] as any;
          const eventName = mapEventName(attr.slice(2));

          el.addEventListener(eventName, handler);
          continue;
        }
        el.setAttribute(attr, attrs[attr].toString());
      }
    }

    if (children) {
      let flatChildren = ToFlatArray(children);

      // 把子节点抽到扁平，提升性能
      for (let child of flatChildren) {
        let childEle: Text | Element | null | undefined | Node;

        if (typeOf(child) === DATA_TYPE.STRING) {
          childEle = document.createTextNode(child as string);
        } else {
          // 为 vdomNode 添加 nextSibling 属性方便层级遍历
          let nextSibling = flatChildren[flatChildren.indexOf(child) + 1];

          if (nextSibling) {
            (child as any).nextSibling = nextSibling;
          }

          childEle = this.parseVDomToElement(child as _Element, hasReRender);
        }

        el.appendChild(childEle);
      }
    }

    if (!hasReRender || (hasReRender && originEle.hasReRenderElement)) {
      // 把真实 dom 挂载到 virtual dom
      originEle.el = el;
    }

    return el;
  }

  private flush(
    dom: Element,
    content: DocumentFragment | HTMLElement | Element
  ) {
    dom.innerHTML = '';
    dom.appendChild(content);
  }

  render(originEle: _Element) {
    this.unParseVdom = Copy(originEle);
    this.vdom = this.execRender(Copy(this.unParseVdom));

    // 渲染真实 dom 节点
    this.a = this.parseVDomToElement(this.vdom);
  }

  bindDOM(dom: Element) {
    this.dom = dom;
    this.flush(dom, this.a);
  }
}

function isSubComponent(child: ElementChild): boolean {
  return (typeOf(child) === DATA_TYPE.OBJECT &&
    (child as Component).instance) as boolean;
}

function mapEventName(name: string) {
  return EventNames[name] || name;
}

function getTextContent(vdomNode: VdomNode): string {
  return vdomNode.children
    .filter(node => typeOf(node) === DATA_TYPE.STRING)
    .join('');
}

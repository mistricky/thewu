import { Injectable } from '@wizardoc/injector';
import { patch } from 'incremental-dom';
import { Compiler } from './compiler';
import Flat from './h';
import { STATE_KEY, COMPUTED_KEY, PROP_KEY, CHILDREN_KEY } from './decorators';

export interface GlobalData {
  [key: string]: any;
}

export interface JSXElement {
  tagName: TagName;
  attrs: Attrs;
  children: Children<JSXElement>;
}

export interface ParsedJSXElement {
  tagName: string;
  attrs: Attrs;
  children: Children<ParsedJSXElement>;
}

export interface FlatComponent {
  render(): ParsedJSXElement;
  [index: string]: unknown;
}

export interface FlatComponentConstructor {
  new (...args: unknown[]): FlatComponent;
  [index: string]: unknown;
}

export interface Attrs {
  [index: string]: any;
}

export type TagName = string | FlatComponentConstructor;

export type Children<T> = (T | string)[];

interface Listeners {
  [name: string]: Function;
}

interface ParsedAttrsResult {
  parsedAttrs: Attrs;
  listeners: Listeners;
}

export const STATE_BIND_PREFIX = 'state$$';
export const COMPUTED_BIND_PREFIX = 'computed$$';
export const FRAGMENT_TAGNAME = 'fragment';
export const PROPS_NAME = 'props';
export const CHILDREN_NAME = 'children';

@Injectable()
export class Render {
  private _vdom?: ParsedJSXElement;
  private _rootDOM?: HTMLElement;
  private globalData: GlobalData = {};
  private isRendered = false;

  private get vdom() {
    if (!this._vdom) {
      throw new Error("Please invoke 'run' before use 'vdom'");
    }

    return this._vdom;
  }

  private get rootDOM() {
    if (!this._rootDOM) {
      throw new Error("Please invoke 'run' before use 'vdom'");
    }

    return this._rootDOM;
  }

  // parse to HTML element and render
  run(vdom: ParsedJSXElement, dom: HTMLElement) {
    this._vdom = vdom;
    this._rootDOM = dom;

    this.update();
  }

  // prepare component and render
  update() {
    patch(this.rootDOM, () => {
      new Compiler(this.vdom, this.globalData).walk();
    });
  }

  renderComponent(
    CustomComponent: FlatComponentConstructor,
    props: Attrs,
    children: Children<ParsedJSXElement>
  ): ParsedJSXElement {
    const instance = this.InitCustomComponent(CustomComponent, props, children);
    const prototype = Object.getPrototypeOf(instance);

    const getKeyFromMetadata = (symbol: Symbol, key: string) =>
      Reflect.getMetadata(symbol, prototype, key);

    const proxyInstance = new Proxy(instance, {
      set: (target, key: string, val, receiver) => {
        const stateKey = getKeyFromMetadata(STATE_KEY, key);

        if (!!stateKey) {
          console.info(val);
          this.globalData[stateKey] = val;
          console.info('trigger: ', Reflect.get(target, 'dist', receiver), val);

          // trigger update and render when set state of the component
          this.update();

          return Reflect.set(target, key, val, receiver);
        }

        return Reflect.set(target, key, val, receiver);
      },
      get: (target, key: string, receiver) => {
        const val = Reflect.get(target, key, receiver);
        const stateKey = getKeyFromMetadata(STATE_KEY, key);
        const computedKey = getKeyFromMetadata(COMPUTED_KEY, key);
        const propName = getKeyFromMetadata(PROP_KEY, key);
        const childrenKey = getKeyFromMetadata(CHILDREN_KEY, key);

        if (!!stateKey) {
          this.globalData[stateKey] = val;

          // the value start with $$ that represent bind to the state
          return this.isRendered ? val : `${STATE_BIND_PREFIX}${stateKey}`;
        }

        // computed
        if (!!computedKey) {
          this.globalData[computedKey] = () =>
            Reflect.get(target, key, receiver);

          return this.isRendered
            ? val
            : `${COMPUTED_BIND_PREFIX}${computedKey}`;
        }

        // props
        if (!!propName) {
          const props = Reflect.get(target, PROPS_NAME, receiver);

          return props[propName];
        }

        // children
        if (!!childrenKey) {
        }

        // methods

        return val;
      }
    });

    // life-circle invoke here
    //////////////////////////

    const renderComponent = proxyInstance.render();

    this.isRendered = true;

    return renderComponent;
    // return {};
  }

  private InitCustomComponent(
    CustomComponent: FlatComponentConstructor,
    injectProps: Attrs,
    injectChildren: Children<ParsedJSXElement>
  ) {
    const instance = new CustomComponent();

    instance[PROPS_NAME] = { ...injectProps };
    instance[CHILDREN_NAME] = Flat(FRAGMENT_TAGNAME, {}, ...injectChildren);
    // instance.prototype.hello = () => instance.dist;

    return instance;
  }
}

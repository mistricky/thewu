import { Injectable } from '@wizardoc/injector';
import { patch, key } from 'incremental-dom';
import {
  Compiler,
  globalData,
  StateListeners,
  globalStateListeners
} from './compiler';
import Flat from './h';
import {
  STATE_KEY,
  COMPUTED_KEY,
  PROP_KEY,
  CHILDREN_KEY,
  COMPONENT_KEY,
  ComponentMetaData,
  ComponentDecoratorOptions
} from './decorators';
import { listeners } from 'process';

export interface JSXElement {
  tagName: TagName;
  attrs: Attrs;
  children: Children<JSXElement>;
}

export interface ParsedJSXElement {
  tagName: string;
  attrs: Attrs;
  componentID?: string;
  children: Children<ParsedJSXElement>;
  options?: ComponentDecoratorOptions;
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

export type UpdateFn = () => void;

type GetKeyFromMetadata = (symbol: Symbol, key: string) => any;

interface PrepareAttrsRes {
  stateListeners: StateListeners;
}

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
  private isRendered = false;
  private update!: UpdateFn;

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

    const compiler = new Compiler(this.vdom);
    const elementGenerators = compiler.walk();

    // init update fn
    this.update = () =>
      patch(this.rootDOM, () => {
        elementGenerators
          .flat(Number.POSITIVE_INFINITY)
          .map(generator => generator());
      });

    this.update();

    // mounted
    compiler.initDirectives();
  }

  renderComponent(
    CustomComponent: FlatComponentConstructor,
    props: Attrs,
    children: Children<ParsedJSXElement>
  ): ParsedJSXElement {
    const instance = this.initCustomComponent(CustomComponent, props, children);
    const prototype = Object.getPrototypeOf(instance);
    const payload = Reflect.getMetadata(
      COMPONENT_KEY,
      CustomComponent
    ) as ComponentMetaData;
    const getKeyFromMetadata = (symbol: Symbol, key: string) =>
      Reflect.getMetadata(symbol, prototype, key);

    if (!payload) {
      throw new Error(`The ${CustomComponent.name} does not a component`);
    }

    const { id, options } = payload;
    const componentID = this.initComponentDataScope(
      instance,
      id,
      getKeyFromMetadata
    );

    const proxyInstance = new Proxy(instance, {
      set: (target, key: string, val, receiver) => {
        // const stateKey = getKeyFromMetadata(STATE_KEY, key);

        if (globalData[componentID][key] !== undefined) {
          globalData[componentID][key] = val;

          // trigger update and render when set state of the component
          window.requestIdleCallback(() => this.update());
          // listeners of states, invoke when the state was changed
          // execute listeners
          this.executeStateListeners(componentID, key);

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

        // if (!!stateKey) {
        //   this.globalData[stateKey] = val;

        //   // the value start with $$ that represent bind to the state
        //   return this.isRendered ? val : `${STATE_BIND_PREFIX}${stateKey}`;
        // }

        // computed
        // if (!!computedKey) {
        //   globalData[computedKey] = () => Reflect.get(target, key, receiver);

        //   return this.isRendered
        //     ? val
        //     : `${COMPUTED_BIND_PREFIX}${computedKey}`;
        // }

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

    return { ...renderComponent, componentID, options };
  }

  private executeStateListeners(componentID: string, stateName: string) {
    for (const listener of globalStateListeners[componentID][stateName] ?? []) {
      listener();
    }
  }

  private initComponentDataScope(
    instance: any,
    id: string,
    getKeyFromMetadata: GetKeyFromMetadata
  ): string {
    //use component as scope of data
    // init data of the component
    globalData[id] = {};

    for (const name of Object.keys(instance)) {
      // pre store states and computed into global data
      if (
        !!getKeyFromMetadata(STATE_KEY, name) ||
        !!getKeyFromMetadata(COMPUTED_KEY, name)
      ) {
        globalData[id][name] = instance[name];

        continue;
      }
    }

    return id;
  }

  private initCustomComponent(
    CustomComponent: FlatComponentConstructor,
    injectProps: Attrs,
    injectChildren: Children<ParsedJSXElement>
  ) {
    const instance = new CustomComponent();

    instance[PROPS_NAME] = { ...injectProps };
    instance[CHILDREN_NAME] = Flat(FRAGMENT_TAGNAME, {}, ...injectChildren);

    return instance;
  }
}

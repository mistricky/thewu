import { Injectable } from '@wizardoc/injector';
import { globalData, globalStateListeners, Runtime } from './compiler';
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
import { isFunction } from '../utils';
import { Dict } from '../typings/utils';
import { key } from 'incremental-dom';

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

interface CurrentCollectInfo {
  key: string;
  fn: () => DepListenerResult;
}

export type TagName = string | FlatComponentConstructor;

export type Children<T> = (T | string)[];

export type UpdateFn = (changeStateNames?: string[]) => void;

type DepListenerResult = Dict<unknown>;
type DepListener = () => DepListenerResult;
type StateDepListeners = Dict<Dict<DepListener[]>>;

const statesDepListeners: StateDepListeners = {};

type StateDepNames = Dict<Dict<string[]>>;

const stateDepNames: StateDepNames = {};

export const FRAGMENT_TAGNAME = 'fragment';
export const PROPS_NAME = 'props';
export const CHILDREN_NAME = 'children';
const RENDER_NAME = 'render';

const SYS_INNER_PROP_NAMES = [
  PROPS_NAME,
  CHILDREN_NAME,
  RENDER_NAME,
  'constructor'
];

@Injectable()
export class Render {
  private _vdom?: ParsedJSXElement;
  private _rootDOM?: HTMLElement;
  private update!: UpdateFn;

  private currentCollectFn: CurrentCollectInfo | undefined;

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

    const runtime = new Runtime(this.vdom);

    // init update fn
    this.update = (changeStateNames?: string[]) => {
      runtime.update(this.rootDOM, changeStateNames);
    };

    this.update();

    // mounted
    runtime.initDirectives();
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

    const proxyInstance = new Proxy(instance, {
      set: (target, key: string, val, receiver) => {
        const stateKey = getKeyFromMetadata(STATE_KEY, key);

        // only change states can trigger update
        if (!!stateKey) {
          Reflect.set(target, key, val, receiver);

          const changedData = Object.assign(
            {},
            ...statesDepListeners[id][key].map(fn => fn())
          );

          // update data for render (side effect)
          Object.assign(globalData[id], changedData, { [key]: val });

          const changedDataKeys = Object.keys(changedData);

          changedDataKeys.push(key);

          // trigger update and render when set state of the component
          window.requestIdleCallback(() => this.update(changedDataKeys));
          // listeners of states, invoke when the state was changed
          // execute listeners
          this.executeStateListeners(id, key);

          return true;
        }

        return Reflect.set(target, key, val, receiver);
      },
      get: (target, key: string, receiver) => {
        const val = Reflect.get(target, key, receiver);
        const stateKey = getKeyFromMetadata(STATE_KEY, key);
        const computedKey = getKeyFromMetadata(COMPUTED_KEY, key);
        const propName = getKeyFromMetadata(PROP_KEY, key);
        const childrenKey = getKeyFromMetadata(CHILDREN_KEY, key);

        // during dep collection
        if (
          !!this.currentCollectFn &&
          this.currentCollectFn.key !== key &&
          !stateDepNames[id][this.currentCollectFn.key]?.includes(key)
        ) {
          (
            statesDepListeners[id][key] ?? (statesDepListeners[id][key] = [])
          ).push(this.currentCollectFn.fn);

          (
            stateDepNames[id][this.currentCollectFn.key] ??
            (stateDepNames[id][this.currentCollectFn.key] = [])
          ).push(key);
        }

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

    this.initComponentDataScope(proxyInstance, prototype, id);

    console.info(stateDepNames);

    // life-circle invoke here
    //////////////////////////
    const renderComponent = proxyInstance.render();

    return { ...renderComponent, componentID: id, options };
  }

  private executeStateListeners(componentID: string, stateName: string) {
    for (const listener of globalStateListeners[componentID][stateName] ?? []) {
      listener();
    }
  }

  private initComponentDataScope(instance: any, prototype: any, id: string) {
    const keys = [
      ...Reflect.ownKeys(prototype),
      ...Object.keys(instance)
    ] as string[];
    // init data of the component
    globalData[id] = {};
    statesDepListeners[id] = {};
    stateDepNames[id] = {};

    for (const key of keys) {
      if (SYS_INNER_PROP_NAMES.includes(key)) {
        continue;
      }

      globalData[id][key] = instance[key];

      if (Reflect.getMetadata(STATE_KEY, prototype, key)) {
        continue;
      }

      if (isFunction(instance[key])) {
        // fn = (...args: unknown[]) => instance[key](...args);
        continue;
      }

      const fn = () => ({ [key]: instance[key] });

      // collect dep begin
      this.currentCollectFn = { fn, key };
      fn();
      this.currentCollectFn = undefined;
    }
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

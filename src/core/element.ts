import { Renderer } from "./renderer";
import { SystemHooks } from "./life-circle";
import { Copy } from "../utils";

export interface Attrs {
  [index: string]: string;
}

export interface LifeCircleHook {
  componentWillMount(): void;
  componentDidMount(): void;
}

export interface Component extends LifeCircleHook, SystemHooks {
  render(): _Element;
  [index: string]: unknown;
}

export interface FlatComponentConstructor {
  new (...args: unknown[]): Component;
  [index: string]: unknown;
}

export type ElementChild =
  | _Element
  | Component
  | string
  | (_Element | string)[];
export type ElementChildren = ElementChild[];

export interface _Element {
  tagName: string | Function | FlatComponentConstructor | Component;
  attrs: Attrs;
  children: ElementChildren;
}

export class FlatElement {
  private el: _Element;
  private renderer: Renderer;

  static ele(
    tagName: string,
    attrs: Attrs,
    children: ElementChildren
  ): _Element {
    return {
      tagName,
      attrs,
      children
    };
  }

  constructor(el: unknown) {
    this.el = Copy(el as _Element);
    this.renderer = new Renderer();
    this.renderer.render(this.el);
  }

  bindDOM(dom: Element | null) {
    if (!dom) throw new Error("Cannot find element");

    this.renderer.bindDOM(dom);
  }
}

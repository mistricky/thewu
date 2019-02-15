import { Renderer } from "./renderer";

export interface Attrs {
  [index: string]: string;
}

export interface LifeCircleHook {
  componentWillMount(): void;
  componentDidMount(): void;
}

export interface Component extends LifeCircleHook {
  render(): _Element;
}

export interface FlatComponentConstructor {
  new (...args: unknown[]): Component;
  [index: string]: unknown;
}
export type ElementChildren = (_Element | string | (_Element | string)[])[];

export interface _Element {
  tagName: string | Function | FlatComponentConstructor;
  attrs: Attrs;
  children: ElementChildren;
}

export class Ele {
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
    this.el = el as _Element;
    this.renderer = new Renderer();
    this.renderer.render(this.el);
  }

  bindDOM(dom: Element | null) {
    if (!dom) throw new Error("Cannot find element");

    this.renderer.bindDOM(dom);
  }
}

import { Renderer } from "./renderer";

export interface Attrs {
  [index: string]: string;
}

export type ElementChildren = (_Element | string)[];

export interface _Element {
  tagName: string;
  attrs: Attrs;
  children: ElementChildren;
}

export class Ele {
  private el: _Element;
  private renderer: Renderer;
  private domEle: Element | undefined;

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

  constructor(el: _Element) {
    this.el = el;
    this.renderer = new Renderer();
    this.domEle = this.renderer.render(this.el);
  }

  bindDOM(dom: Element | null) {
    if (!dom) throw new Error("Cannot find element");

    this.renderer.bindDOM(dom, this.domEle);
  }

  getDOMEle(): Element | undefined {
    return this.domEle;
  }
}

// import { Renderer } from './renderer-backup';
import { isFunction } from '../utils';
import { JSXElement, Attrs, Renderer } from './renderer';

export interface StateType {
  [index: string]: any;
}

// export type ElementChild =
//   | JSXElement
//   | Component
//   | string
//   | (JSXElement | string)[];
// export type ElementChildren = ElementChild[];

export class FlatElement {
  private renderEl: Element;

  static ele(
    tagName: string,
    attrs: Attrs,
    children: JSXElement[]
  ): JSXElement {
    return {
      tagName,
      attrs,
      children
    };
  }

  // is it a custom component
  static isFlatComponent(jsx: JSXElement): boolean {
    return isFunction(jsx.tagName);
  }

  constructor(el: JSX.Element) {
    console.info(new (el as any).tagName().render());

    this.renderEl = new Renderer(
      (el as unknown) as JSXElement
    ).renderToElement();
  }

  bindDOM(dom: Element | null) {
    if (!dom) throw new Error('Cannot find element');

    dom.appendChild(this.renderEl);
  }
}

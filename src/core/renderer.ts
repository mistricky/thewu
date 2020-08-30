import { isString, isObject } from '../utils';

export interface JSXElement {
  tagName: TagName;
  attrs: Attrs;
  children: Children<JSXElement>;
}

interface ParsedJSXElement {
  tagName: string;
  attrs: Attrs;
  children: Children<ParsedJSXElement>;
}

export interface FlatComponent {
  render(): JSXElement;
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

export type Children<T> = string | (T | string)[];

interface Listeners {
  [name: string]: Function;
}

interface ParsedAttrsResult {
  parsedAttrs: Attrs;
  listeners: Listeners;
}

const EVENT_PREFIX = '$';

export class Renderer {
  constructor(private root: JSXElement) {}

  renderToElement(): Element {
    return this.renderJSXToHTMLNode(this.root);
  }

  private parseTagName(CustomComponent: FlatComponentConstructor): JSXElement {
    // TODO: can inject some data to the constructor of component
    // create instance of component
    return new CustomComponent().render();
  }

  // render the JSX element to HTML element
  renderJSXToHTMLNode(JSXEl: JSXElement): Element {
    const { tagName, children, attrs } = (isString(JSXEl.tagName)
      ? JSXEl
      : this.parseTagName(JSXEl.tagName)) as ParsedJSXElement;

    const renderEl = document.createElement(tagName);
    const { parsedAttrs, listeners } = this.parseAttrs(attrs);

    // attach listeners on element
    for (const name of Object.keys(listeners)) {
      renderEl.addEventListener(name as any, listeners[name] as any);
    }

    console.info(parsedAttrs);

    for (const attrName of Object.keys(parsedAttrs)) {
      renderEl.setAttribute(attrName, parsedAttrs[attrName]);
    }

    if (isString(children)) {
      renderEl.appendChild(document.createTextNode(children));

      return renderEl;
    }

    // the children is a array of [component | string]
    for (const child of children) {
      if (isString(child)) {
        renderEl.appendChild(document.createTextNode(child));
      } else if (isObject(child)) {
        renderEl.appendChild(this.renderJSXToHTMLNode(child));
      }
    }

    return renderEl;
  }

  private parseAttrs(attrs: Attrs): ParsedAttrsResult {
    const parsedAttrs: Attrs = {};
    const listeners: Listeners = {};

    for (const name of Object.keys(attrs)) {
      // handing element events
      if (name.startsWith(EVENT_PREFIX)) {
        listeners[name.slice(1)] = attrs[name];
      } else {
        parsedAttrs[name] = attrs[name];
      }
    }

    return { parsedAttrs, listeners };
  }
}

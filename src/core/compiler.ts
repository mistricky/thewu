import { elementVoid, elementOpen, elementClose, text } from 'incremental-dom';
import { ParsedJSXElement, Attrs } from './render';
import { isString, isFunction } from '../utils';
import { GlobalData, STATE_BIND_PREFIX } from './render';

export class Compiler {
  constructor(private root: ParsedJSXElement, private globalData: GlobalData) {}

  walk() {
    return this.compileJSXToIncremental(this.root);
  }

  private compileJSXToIncremental(vdom: ParsedJSXElement) {
    const { children } = vdom;

    if (!children || !children.length) {
      return this.transformElementVoidNode(vdom);
    } else {
      return this.transformElementNormalNode(vdom);
    }
  }

  private transformElementVoidNode({
    tagName,
    attrs
  }: ParsedJSXElement): Element {
    return elementVoid(tagName, null, null, ...this.parseAttrs(attrs));
  }

  private transformElementNormalNode({
    tagName,
    attrs,
    children
  }: ParsedJSXElement): any {
    return [
      elementOpen(tagName, null, null, ...this.parseAttrs(attrs)),
      children.map(child => {
        if (!child) {
          return;
        }

        if (!isString(child)) {
          return this.compileJSXToIncremental(child);
        }

        // the value probably has bind to state
        return this.parseDynamicContent(child);
      }),
      elementClose(tagName)
    ];
  }

  private parseDynamicContent(child: string) {
    const DYNAMIC_PREFIX = /^.+\$\$/;

    if (!DYNAMIC_PREFIX.test(child)) {
      return text(child);
    }

    const dynamicData = this.globalData[child.replace(DYNAMIC_PREFIX, '')];

    if (dynamicData === undefined) {
      return text(child);
    }

    // parse computed
    if (isFunction(dynamicData)) {
      return text(dynamicData());
    }

    // normal dynamic data
    return text(dynamicData);
  }

  private parseAttrs(attrs: Attrs): string[] {
    const flatAttrs: string[] = [];

    for (const name of Object.keys(attrs ?? {})) {
      // TODO: handing $$ prop
      flatAttrs.push(name, attrs[name]);
    }

    return flatAttrs;
  }

  // handing attrs before parse to array
  private prepareAttrs() {
    // handing event listener
  }
}

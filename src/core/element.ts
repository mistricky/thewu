// import { Renderer } from './renderer-backup';
import { extract } from '@wizardoc/injector';
import { Render } from './render';
import { ParsedJSXElement } from './render';

export interface StateType {
  [index: string]: any;
}

export class FlatElement {
  constructor(private vdom: JSX.Element) {}

  bindDOM(dom: HTMLElement | null) {
    if (!dom) {
      throw new Error('Cannot find this element');
    }

    extract(Render).run(this.vdom as ParsedJSXElement, dom);
  }
}

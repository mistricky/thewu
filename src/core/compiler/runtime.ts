import { Compiler, ElementGenerator } from './compiler';
import { patch } from 'incremental-dom';
import { ParsedJSXElement } from '../render';

export class Runtime {
  private lazyNodes: ElementGenerator[] = [];
  private compiler: Compiler;

  constructor(root: ParsedJSXElement) {
    this.compiler = new Compiler(root);

    this.lazyNodes = this.compiler.walk();
  }

  initDirectives() {
    this.compiler.initDirectives();
  }

  update(dom: HTMLElement, changeStateNames?: string[]) {
    patch(dom, () => {
      this.lazyNodes.map(generator => generator(changeStateNames ?? []));
    });
  }
}

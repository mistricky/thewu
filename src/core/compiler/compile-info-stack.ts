import { ComponentDecoratorOptions } from '../decorators';
import { globalStateListeners } from '../global-data';
import { ParsedJSXElement } from '../render';

interface CompileComponentInfo {
  id?: string;
  options?: ComponentDecoratorOptions;
}

export class CompileInfoStack {
  private stack: CompileComponentInfo[] = [];

  push({ componentID: id, options }: ParsedJSXElement) {
    if (id) {
      globalStateListeners[id] = {};
      this.stack.push({
        id,
        options
      });
    }
  }

  pop() {
    this.stack.pop();
  }

  get currentInfo(): CompileComponentInfo {
    return this.stack[this.stack.length - 1] ?? {};
  }
}

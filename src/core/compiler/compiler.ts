import { elementVoid, elementOpen, elementClose, text } from 'incremental-dom';
import { ParsedJSXElement, Attrs } from '../render';
import { isString } from '../../utils';
import { Dict } from '../../typings/utils';
import { generate } from 'shortid';
import { DIRECTIVE_PREFIX } from '../directive';
import { globalData } from '../global-data';
import { CompileInfoStack } from './compile-info-stack';
import { VM } from './vm';
import { DirectiveCompiler } from './directive-compiler';

export type ElementGenerator = (changeStateNames: string[]) => Element;
export type ElementGenerators = (ElementGenerators | ElementGenerator)[];
export type StateListeners = Dict<(() => void)[]>;

export class Compiler {
  private compileStack = new CompileInfoStack();
  private vm = new VM();
  private directiveObservers: Function[] = [];

  constructor(private root: ParsedJSXElement) {}

  walk() {
    return (
      this.compileJSXToIncremental(this.root)
        // .filter((generator: any) => !!generator)
        .flat(Number.POSITIVE_INFINITY)
    );
  }

  private compileJSXToIncremental(vdom: ParsedJSXElement) {
    const { children } = vdom;

    this.compileStack.push(vdom);

    if (!children || !children.length) {
      return this.transformElementVoidNode(vdom);
    } else {
      return this.transformElementNormalNode(vdom);
    }
  }

  private transformElementVoidNode({
    tagName,
    attrs
  }: ParsedJSXElement): ElementGenerator {
    const parsedAttrs = this.parseAttrs(attrs);

    return () => elementVoid(tagName, null, null, ...parsedAttrs);
  }

  private transformElementNormalNode({
    tagName,
    attrs,
    children
  }: ParsedJSXElement): any {
    const parsedAttrs = this.parseAttrs(attrs);
    const dependencyData = children.map(child => {
      if (!child || !isString(child)) {
        return undefined;
      }

      const result = child.match(/%([^%]+)%/g);

      if (!result) {
        return {
          depStates: [],
          valueUpdater: () => child,
          value: child
        };
      }

      const depStates = result
        .map(expr =>
          this.vm.findDependencyStates(
            expr.replace(/%/g, ''),
            this.componentGlobalData
          )
        )
        .flat();
      const value = () =>
        child.replace(/%([^%]*)%/g, (_, expr) =>
          this.vm.computeExpression(expr, this.componentGlobalData)
        );

      return {
        depStates,
        valueUpdater: () => value(),
        value: value()
      };
    });

    // runtime
    return [
      () => elementOpen(tagName, null, null, ...parsedAttrs),
      children.map((child, i) => {
        if (!child) {
          return;
        }

        if (!isString(child)) {
          const result = this.compileJSXToIncremental(child);

          if (!child.componentID) {
            return result;
          }

          this.compileStack.pop();

          return result;
        }

        const data = dependencyData[i]!;

        return (changeStateNames: string[]) => {
          // update value when depState has been changed
          for (const changedStateName of changeStateNames) {
            if (data.depStates.includes(changedStateName)) {
              data.value = data.valueUpdater();

              return text(data.value);
            }
          }

          return text(data.value);
        };
      }),
      () => elementClose(tagName)
    ];
  }

  private get currentCompileInfo() {
    return this.compileStack.currentInfo;
  }

  private get componentGlobalData(): Dict {
    return globalData[this.currentCompileInfo.id ?? ''] ?? {};
  }

  private parseAttrs(attrs: Attrs): string[] {
    const elementID = generate();
    const flatAttrs: string[] = ['id', elementID];
    const directiveCompiler = new DirectiveCompiler(
      this.currentCompileInfo,
      this.componentGlobalData
    );
    const { id, options } = this.currentCompileInfo;

    for (const name of Object.keys(attrs ?? {})) {
      const attrVal = attrs[name];

      // parse directives
      if (name.startsWith(DIRECTIVE_PREFIX) && id && options) {
        const listener = directiveCompiler.compile(name, attrVal, elementID);

        if (listener) {
          this.directiveObservers.push(listener);
        }

        continue;
      }

      flatAttrs.push(name, attrVal);
    }

    return flatAttrs;
  }

  initDirectives() {
    for (const listener of this.directiveObservers) {
      listener();
    }
  }
}

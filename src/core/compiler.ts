import { elementVoid, elementOpen, elementClose, text } from 'incremental-dom';
import { ParsedJSXElement, Attrs } from './render';
import { isString, isFunction, typeOf } from '../utils';
import { STATE_BIND_PREFIX } from './render';
import { Dict } from '../typings/utils';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { transformFromAst } from '@babel/core';
import vm from 'vm';
import { generate } from 'shortid';
import {
  DIRECTIVE_PREFIX,
  DIRECTIVE_KEY,
  DirectiveOptions,
  PropertyDirective,
  StructureDirective,
  IDirective,
  isPropertyDirective
} from './directive';
import { ComponentDecoratorOptions } from './decorators';

export type ElementGenerator = () => Element;
export type ElementGenerators = (ElementGenerators | ElementGenerator)[];
export type StateListeners = Dict<(() => void)[]>;

type ComponentScopeGlobalData = Dict<unknown | Function>;

export type GlobalData = Dict<ComponentScopeGlobalData>;

export const globalData: GlobalData = {};
export const globalStateListeners: Dict<StateListeners> = {};

interface FindDirectiveRes {
  directive: IDirective;
  options: DirectiveOptions;
}

export class Compiler {
  private currentRenderComponentID?: string;
  private currentRenderComponentOptions?: ComponentDecoratorOptions;
  private directiveObservers: Function[] = [];

  constructor(private root: ParsedJSXElement) {}

  walk(): ElementGenerators {
    return this.compileJSXToIncremental(this.root);
  }

  private compileJSXToIncremental(vdom: ParsedJSXElement) {
    const { children, componentID, options } = vdom;

    if (componentID) {
      this.currentRenderComponentID = componentID;
      globalStateListeners[componentID] = {};
    }

    if (options) {
      this.currentRenderComponentOptions = options;
    }

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

    return [
      () => elementOpen(tagName, null, null, ...parsedAttrs),
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
      () => elementClose(tagName)
    ];
  }

  private get componentGlobalData(): Dict {
    const data = globalData[this.currentRenderComponentID ?? ''] ?? {};

    return Object.keys(data).reduce(
      (pre, name) => ({
        ...pre,
        [name]: isFunction(data[name]) ? (data[name] as Function)() : data[name]
      }),
      {}
    );
  }

  private parseDynamicContent(child: string) {
    return () =>
      text(
        child.replace(/%([^%]*)%/g, (_, expr) => this.computeExpression(expr))
      );

    // const DYNAMIC_PREFIX = /^.+\$\$/;

    // if (!DYNAMIC_PREFIX.test(child)) {
    //   return text(child);
    // }

    // const dynamicData = this.globalData[child.replace(DYNAMIC_PREFIX, '')];

    // if (dynamicData === undefined) {
    //   return text(child);
    // }

    // // parse computed
    // if (isFunction(dynamicData)) {
    //   return text(dynamicData());
    // }

    // // normal dynamic data
    // return text(this.globalData[dynamicData]);
  }

  private parseAttrs(attrs: Attrs): string[] {
    const elementID = generate();
    const flatAttrs: string[] = ['id', elementID];
    const findDirective = (name: string) => {
      let result: FindDirectiveRes | undefined;

      console.info('parseAttrs');

      for (const directive of (
        this.currentRenderComponentOptions ?? { directives: [] }
      ).directives) {
        const directiveOptions = Reflect.getMetadata(
          DIRECTIVE_KEY,
          directive
        ) as DirectiveOptions;

        if (!directiveOptions) {
          throw new Error(
            'Cannot find the directive, please make sure you use the @Directive decorator'
          );
        }

        if (directiveOptions.name === name.slice(1)) {
          result = {
            directive,
            options: directiveOptions
          };
        }
      }

      return result;
    };

    for (const name of Object.keys(attrs ?? {})) {
      const attrVal = attrs[name];

      if (
        name.startsWith(DIRECTIVE_PREFIX) &&
        this.currentRenderComponentOptions &&
        this.currentRenderComponentID
      ) {
        const result = findDirective(name);

        if (!result) {
          throw new Error(`Cannot find the directive that name is ${name}`);
        }

        const {
          directive,
          options: { valueRegex, valueType }
        } = result;
        const computedAttrVal = this.computeExpression(attrVal);

        // validate value type by Regex
        if (valueRegex && !valueRegex.test(computedAttrVal)) {
          throw new Error('Cannot match the value of attribute');
        }

        // validate value type by typeof
        if (
          computedAttrVal === '' ||
          (valueType &&
            vm.runInNewContext(
              `typeOf(${computedAttrVal}) !== "${valueType}"`,
              {
                typeOf
              }
            ))
        ) {
          throw new Error('Attribute type error');
        }

        // collect listeners of state
        this.handingDirectives(elementID, name, attrVal, directive);

        continue;
      }

      // TODO: handing $$ prop
      flatAttrs.push(name, attrVal);
    }

    return flatAttrs;
  }

  private handingDirectives(
    id: string,
    name: string,
    rawVal: string,
    Directive: PropertyDirective | StructureDirective
  ): StateListeners {
    const stateNames = this.findDependencyStates(rawVal);
    const directive = new (Directive as any)();

    console.info(stateNames);

    const registerStateObserver = (listener: () => void) => {
      for (const name of stateNames) {
        const listeners =
          globalStateListeners[this.currentRenderComponentID!][name];

        globalStateListeners[this.currentRenderComponentID!][name] = [
          ...(listeners ?? []),
          listener
        ];
      }
    };

    if (isPropertyDirective(directive)) {
      const listener = () =>
        directive.onPropertyObserve(
          document.getElementById(id)!,
          this.computeExpression(rawVal)
        );

      this.directiveObservers.push(listener);
      registerStateObserver(listener);
    }

    return {};
  }

  private computeExpression(expr: string) {
    let res: any;

    // console.info(this.componentGlobalData);

    try {
      res = vm.runInNewContext(`res = ${expr}`, this.componentGlobalData ?? {});
    } catch (e) {
      throw new Error(`Unexpected expression: ${expr}`);
    }

    return res;
  }

  private findDependencyStates = (code: string) => {
    const stateNames: string[] = [];

    const retryInVM = (params: vm.Context) => {
      try {
        vm.runInNewContext(code, params);
      } catch (e) {
        const matches = /([^\s]+) is not defined/.exec(e.message);

        // rethrow the error if occur an unexpected error
        if (!matches) {
          throw e;
        }

        const stateName = matches[1];
        const stateVal = this.componentGlobalData[stateName];

        if (!stateVal) {
          throw new Error(`Cannot find the variable ${stateName}`);
        }

        stateNames.push(stateName);

        retryInVM({ ...params, ...{ [stateName]: stateVal } });
      }
    };

    retryInVM({});

    return stateNames;
  };

  initDirectives() {
    for (const listener of this.directiveObservers) {
      listener();
    }
  }
}

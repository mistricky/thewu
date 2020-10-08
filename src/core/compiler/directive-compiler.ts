import {
  DirectiveOptions,
  DIRECTIVE_KEY,
  IDirective,
  isPropertyDirective,
  PropertyDirective,
  StructureDirective
} from '../directive';
import { CompileComponentInfo, CompileInfoStack } from './compile-info-stack';
import vm from 'vm';
import { typeOf } from '../../utils';
import { VM } from './vm';
import { globalData, globalStateListeners } from '../global-data';
import { Dict } from '../../typings/utils';
import { INNER_INSTANCE_NAME } from '../render';

interface FindDirectiveRes {
  directive: IDirective;
  options: DirectiveOptions;
}

export class DirectiveCompiler {
  private vm = new VM();

  constructor(
    private currentCompileInfo: CompileComponentInfo,
    private componentGlobalData: Dict
  ) {}

  compile(name: string, value: any, elementID: string) {
    const result = this.findDirective(name);

    if (!result) {
      throw new Error(`Cannot find the directive that name is ${name}`);
    }

    const {
      directive,
      options: { valueRegex, valueType }
    } = result;
    const computedAttrVal = this.vm.computeExpression(
      value,
      this.componentGlobalData
    );

    // validate value type by Regex
    if (valueRegex && !valueRegex.test(computedAttrVal)) {
      throw new Error('Cannot match the value of attribute');
    }

    // validate value type by typeof
    if (
      computedAttrVal === '' ||
      (valueType &&
        vm.runInNewContext(`typeOf(${computedAttrVal}) !== "${valueType}"`, {
          typeOf
        }))
    ) {
      throw new Error('Attribute type error');
    }

    // collect listeners of state
    return this.handingDirectives(elementID, name, value, directive);
  }

  private findDirective(name: string) {
    let result: FindDirectiveRes | undefined;

    for (const directive of (
      this.currentCompileInfo.options ?? { directives: [] }
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
  }

  private handingDirectives(
    id: string,
    name: string,
    rawVal: string,
    Directive: PropertyDirective | StructureDirective
  ): Function | undefined {
    const { id: componentID } = this.currentCompileInfo;
    const stateNames = this.vm.findDependencyStates(
      rawVal,
      this.componentGlobalData
    );
    const directive = new (Directive as any)();
    const scopeData = globalStateListeners[componentID!];

    const registerStateObserver = (listener: () => void) => {
      for (const name of stateNames) {
        const listeners = scopeData[name];

        scopeData[name] = [...(listeners ?? []), listener];
      }
    };

    if (isPropertyDirective(directive)) {
      const listener = () =>
        directive.onPropertyObserve(
          document.getElementById(id)!,
          this.vm.computeExpression(rawVal, this.componentGlobalData),
          {
            updateInstance: setData => {
              Object.assign(
                globalData[componentID!][INNER_INSTANCE_NAME] as object,
                setData
              );
            },
            computeExpression: expr =>
              this.vm.computeExpression(expr, this.componentGlobalData)
          }
        );

      registerStateObserver(listener);

      return listener;
    }
  }
}

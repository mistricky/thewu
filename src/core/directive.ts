import { DataType } from '../utils';

export const DIRECTIVE_PREFIX = '$';
export const DIRECTIVE_KEY = Symbol('flat:directive');

export interface IDirective {}

export interface StructureDirective extends IDirective {}

export interface PropertyDirective extends IDirective {
  onPropertyObserve(el: HTMLElement, value: any): void;
}

export interface DirectiveOptions {
  name: string;
  valueRegex?: RegExp;
  valueType?: DataType;
}

export function isPropertyDirective(
  directive: IDirective
): directive is PropertyDirective {
  return !!(directive as PropertyDirective).onPropertyObserve;
}

export function Directive(options: DirectiveOptions) {
  return (target: any) => {
    Reflect.defineMetadata(DIRECTIVE_KEY, options, target);
  };
}

import { PropertyDirective, Directive } from '../../core';

type StylesDirectiveValue = {
  [key in keyof CSSStyleDeclaration]: string;
};

@Directive({ name: 'styles' })
export class StylesDirective implements PropertyDirective {
  onPropertyObserve(el: HTMLElement, input: StylesDirectiveValue): void {
    for (const styleName of Object.keys(input)) {
      const prop = styleName as any;

      el.style[prop] = input[prop];
    }
  }
}

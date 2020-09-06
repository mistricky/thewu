export * from './core';
export * from './utils';
export * from './typings';

declare global {
  namespace JSX {
    interface Element {}

    interface IntrinsicElements {
      [index: string]: unknown;
    }

    // 值类型元素
    interface ElementClass {
      render(): Element;
    }

    // interface ElementAttributesProperty {}

    // interface ElementChildrenAttribute {}
  }
}

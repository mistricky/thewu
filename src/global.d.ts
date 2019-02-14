export {};

declare global {
  namespace JSX {
    interface Element {}

    // 固有元素的接口
    interface IntrinsicElements {
      [index: string]: unknown;
    }

    // 值类型元素
    interface ElementClass {
      render(): Element;
    }

    interface ElementAttributesProperty {
      props: unknown;
    }
  }
}

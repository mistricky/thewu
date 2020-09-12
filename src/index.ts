export * from './core';
export * from './utils';
export * from './directives';

type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};

declare global {
  interface Window {
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions
    ) => RequestIdleCallbackHandle;
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
  }

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

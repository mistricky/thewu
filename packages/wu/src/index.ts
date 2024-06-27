declare global {
  namespace JSX {
    // interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    type Element = any;
  }
}

export type WuNode = JSX.Element;

export type FunctionComponent = (...args: any[]) => JSX.Element | null;

export const createElement = (
  type: string,
  props: Record<string, any>,
  ...children: JSX.Element[]
) => {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
};

export const createFragment = () => "fragment";

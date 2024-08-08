import {
  Component,
  ComponentType,
  isClassComponent,
  isFunctionComponent,
  separateHandlersAndProps,
  Tag,
  withDefaultWuNode,
  WuNode,
  WuNodeType,
} from "@thewu/core";

const createElement = (tag: Tag, props?: Record<string, any>) => {
  const { children = [], ...parsedProps } = props ?? {};
  const createWuNodeByJSXElement = (node: Partial<WuNode> | undefined = {}) =>
    withDefaultWuNode(
      { children: [].concat(children), tag, ...node },
      parsedProps,
    );

  if (isClassComponent(tag)) {
    const instance = tag.createInstance({ props: parsedProps });

    instance.updateProps(parsedProps);

    const vdom = instance.render();

    return createWuNodeByJSXElement({
      value: instance,
      ...vdom,
      componentType: ComponentType.CLASS_COMPONENT,
    });
  }

  // If the node is fragment or functional component
  if (isFunctionComponent(tag)) {
    const vdom = tag(parsedProps);

    return !Object.keys(vdom).length
      ? // If the vdom is fragment
        createWuNodeByJSXElement({ type: WuNodeType.FRAGMENT })
      : createWuNodeByJSXElement({
          ...vdom,
          value: tag,
          componenType: ComponentType.FUNCTION_COMPONENT,
        });
  }

  return createWuNodeByJSXElement();
};

export const jsx = createElement;
export const jsxs = createElement;
export const jsxDEV = createElement;

export const Fragment = (children: JSX.Element[]) => children;

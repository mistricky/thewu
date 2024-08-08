import { ParsedWuNode, TransformedNode } from "../initialize";
import { WuNodeType } from "../jsx";

export const updateParentEl = <
  T extends Pick<ParsedWuNode, "parentEl" | "parentNode">,
>(
  item: T,
  parentEl: HTMLElement,
) => {
  item.parentNode!.el = parentEl;
  item.parentEl = parentEl;
};

export const applyWithFragmentType =
  <T extends (item: ParsedWuNode, ...args: any[]) => any>(applyFn: T) =>
  (...args: Parameters<T>) => {
    const [item, ...restArgs] = args;

    if (item.type === WuNodeType.FRAGMENT) {
      item.children.forEach((child) => applyFn(child, ...restArgs));
      return;
    }

    applyFn(item, ...restArgs);
  };

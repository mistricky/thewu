import { diffObjects } from "../../diff";

export const patchStyle = (
  el: HTMLElement,
  oldStyle: CSSStyleDeclaration,
  newStyle: CSSStyleDeclaration,
) => {
  const { added, updated, removed } = diffObjects(oldStyle, newStyle);

  for (const key of added.concat(updated)) {
    el.style[key] = newStyle[key];
  }

  for (const key of removed) {
    el.style[key] = null;
  }
};

import { diffObjects } from "../../diff";

export type Style = Record<string, any>;

export const patchStyle = (
  el: HTMLElement,
  oldStyle: Style,
  newStyle: Style,
) => {
  const { added, updated, removed } = diffObjects(oldStyle, newStyle);

  for (const key of added.concat(updated)) {
    (el.style as Style)[key] = newStyle[key];
  }

  for (const key of removed) {
    (el.style as Style)[key] = null;
  }
};

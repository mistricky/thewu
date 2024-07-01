import { WuNodeProps } from "../../../jsx";
import { diffObjects } from "../../diff";

export const patchAttrs = (
  el: HTMLElement,
  oldAttrs: WuNodeProps,
  newAttrs: WuNodeProps,
) => {
  const { added, updated, removed } = diffObjects(oldAttrs, newAttrs);

  for (const key of added.concat(updated)) {
    el.setAttribute(key.toString(), newAttrs[key]);
  }

  for (const key of removed) {
    el.removeAttribute(key.toString());
  }
};

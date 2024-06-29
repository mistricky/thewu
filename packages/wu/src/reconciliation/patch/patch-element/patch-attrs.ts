import { WuNodeProps } from "../../../jsx";
import { diffObjects } from "../../diff";

export const patchAttrs = (
  el: HTMLElement,
  oldAttrs: WuNodeProps,
  newAttrs: WuNodeProps,
) => {
  const { added, updated, removed } = diffObjects(oldAttrs, newAttrs);

  for (const key of added.concat(updated)) {
    console.info("add attr", key, newAttrs[key]);

    el.setAttribute(key.toString(), newAttrs[key]);
  }

  for (const key of removed) {
    console.info("removed attr", key, oldAttrs[key as any]);

    el.removeAttribute(key.toString());
  }
};

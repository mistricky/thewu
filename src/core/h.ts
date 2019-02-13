import { Attrs, ElementChildren, _Element } from "./element";

export type HyperScript = (
  tagName: string,
  attrs: Attrs,
  ...children: ElementChildren
) => _Element;

export default function Flat(
  tagName: string,
  attrs: Attrs,
  ...children: ElementChildren
): _Element {
  return {
    tagName,
    attrs: attrs || {},
    children
  };
}

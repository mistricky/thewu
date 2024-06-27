import { ParsedWuNode, insert, renderToDOM } from "../utils";

// Render VDom to real dom and mount it on HTML element
export const mount = (
  vdom: ParsedWuNode,
  container: HTMLElement,
  position?: number,
) => insert(renderToDOM(vdom), container, position);

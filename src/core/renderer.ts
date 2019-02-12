import { _Element } from "./element";

export class Renderer {
  render(originEle: _Element): Element {
    let { tagName, attrs, children } = originEle;
    let el = document.createElement(tagName);

    for (let attrName of Object.keys(attrs)) {
      el.setAttribute(attrName, attrs[attrName]);
    }

    for (let child of children) {
      let childEle: Text | Element | undefined;

      if (typeof child === "string") {
        childEle = document.createTextNode(child);
      } else {
        childEle = this.render(child);
      }

      el.appendChild(childEle);
    }

    return el;
  }

  bindDOM(dom: Element, originDOMELe: Element | undefined) {
    if (!originDOMELe) {
      throw new Error("originDOMEle is not Define!");
    }

    dom.innerHTML = "";
    dom.appendChild(originDOMELe);
  }
}

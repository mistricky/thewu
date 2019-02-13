import { _Element, ElementChildren, FlatComponentConstructor } from "./element";
import { typeOf } from "../utils";
import { DATA_TYPE } from "./data-types";

export class Renderer {
  private tpl: HTMLTemplateElement = document.createElement("template");

  private flat(children: ElementChildren): ElementChildren {
    let flatChildren: ElementChildren = [].concat(...(children as any));

    flatChildren.map(child =>
      typeOf(child) === DATA_TYPE.OBJECT
        ? this.flat((child as _Element).children)
        : child
    );

    return flatChildren;
  }

  private parseVDom(originEle: _Element): Element {
    let { tagName, attrs, children } = originEle;

    if (typeOf(tagName) === DATA_TYPE.FUNCTION) {
      return this.parseVDom(
        new (tagName as FlatComponentConstructor)().render()
      );
    }

    let el = document.createElement(tagName as string);

    if (attrs) {
      for (let attrName of Object.keys(attrs)) {
        el.setAttribute(attrName, attrs[attrName]);
      }
    }

    if (children) {
      for (let child of children) {
        let childEle: Text | Element | null | undefined;

        if (typeof child !== "object") {
          childEle = document.createTextNode(child);
        } else {
          childEle = this.parseVDom(child as _Element);
        }

        el.appendChild(childEle);
      }
    }

    return el;
  }

  render(originEle: _Element) {
    originEle.children = this.flat(originEle.children);
    this.tpl.content.appendChild(this.parseVDom(originEle));
  }

  bindDOM(dom: Element) {
    dom.innerHTML = "";
    dom.appendChild(document.importNode(this.tpl.content, true));
  }
}

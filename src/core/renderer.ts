import {
  _Element,
  ElementChildren,
  FlatComponentConstructor,
  Attrs
} from "./element";
import { typeOf } from "../utils";
import { DATA_TYPE } from "./data-types";
import { PROP_KEY, CHILDREN_KEY } from "./decorators";

export class Renderer {
  private tpl: HTMLTemplateElement = document.createElement("template");

  private injectProperty(
    component: FlatComponentConstructor,
    metadataKey: Symbol,
    property: Attrs | ElementChildren,
    isIterable: boolean = true
  ) {
    let data = Reflect.getMetadata(metadataKey, component.prototype);

    if (!data) return component;

    return class extends component {
      constructor() {
        super();

        let self: { [index: string]: unknown } = this;

        if (isIterable) {
          for (let prop of data) {
            self[prop] = (property as Attrs)[prop];
          }
        } else {
          self[data] = property;
        }
      }
    };
  }

  private injectChildren(
    component: FlatComponentConstructor,
    children: ElementChildren
  ) {
    return this.injectProperty(component, CHILDREN_KEY, children, false);
  }

  private injectProps(component: FlatComponentConstructor, attrs: Attrs) {
    return this.injectProperty(component, PROP_KEY, attrs);
  }

  private parseVDom(originEle: _Element): Element {
    let { tagName, attrs, children } = originEle;

    if (typeOf(tagName) === DATA_TYPE.FUNCTION) {
      let component = tagName as FlatComponentConstructor;

      component = this.injectProps(component, attrs);
      component = this.injectChildren(component, children);

      return this.parseVDom(new component().render());
    }

    let el = document.createElement(tagName as string);

    if (attrs) {
      for (let attrName of Object.keys(attrs)) {
        el.setAttribute(attrName, attrs[attrName]);
      }
    }

    if (children) {
      // 把数组压到扁平，提升性能
      for (let child of [].concat(...(children as any))) {
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
    this.tpl.content.appendChild(this.parseVDom(originEle));
  }

  bindDOM(dom: Element) {
    dom.innerHTML = "";
    dom.appendChild(document.importNode(this.tpl.content, true));
  }
}

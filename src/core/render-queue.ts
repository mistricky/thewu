import { Attrs } from "./element";
import { mapPop } from "../utils";

export class RenderQueue {
  // render queue
  private _keys: Symbol[] = [];
  private deferAttrs: Map<Symbol, Attrs> = new Map();

  get keys() {
    return this._keys;
  }

  removeKey(_key: Symbol) {
    this._keys.splice(this._keys.indexOf(_key), 1);
  }

  addKey(_key: Symbol) {
    this._keys.push(_key);
  }

  getAttrs(_key: Symbol): Attrs | undefined {
    return mapPop(this.deferAttrs, _key);
  }

  setAttrs(_key: Symbol, attrs: Attrs) {
    this.deferAttrs.set(_key, attrs);
  }
}

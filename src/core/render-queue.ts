export class RenderQueue {
  // render queue
  keys: Symbol[] = [];

  removeKey(_key: Symbol) {
    this.keys.splice(this.keys.indexOf(_key), 1);
  }

  addKey(_key: Symbol) {
    this.keys.push(_key);
  }
}

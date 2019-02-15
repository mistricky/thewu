import { FlatComponentConstructor, _Element, Component } from "./element";

export interface SystemHooks {
  _sysDidMount(): void;
  _key: symbol;
}

/** 只负责调用生命周期钩子 */
export function processLifeCircle(instance: Component): _Element {
  instance.componentWillMount();
  let vdom = instance.render();
  instance.componentDidMount();
  instance._sysDidMount();

  return vdom;
}

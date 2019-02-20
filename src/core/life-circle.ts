// legacy

// import { FlatComponentConstructor, _Element, Component } from "./element";
// import { Vdom } from "./renderer";

export interface SystemHooks {
  _sysDidMount(): void;
  _key: symbol;
}

// /** 只负责调用生命周期钩子 */
// export function processLifeCircle(
//   instance: Component,
//   execRender: () => Vdom
// ): _Element {
//   instance.componentWillMount();
//   let vdom = instance.render();

//   instance.componentDidMount();
//   instance._sysDidMount();

//   return vdom;
// }

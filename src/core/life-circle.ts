import { FlatComponentConstructor, _Element } from "./element";

export function processLifeCircle(
  component: FlatComponentConstructor
): _Element {
  let { componentWillMount, componentDidMount, render } = new component();

  componentWillMount();
  let vdom = render();
  componentDidMount();

  return vdom;
}

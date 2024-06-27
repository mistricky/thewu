import {
  Dispatcher,
  ParsedWuNode,
  Reducer,
  prepare,
  renderToDOM,
} from "./utils";
import { destroy } from "./renderer/destroy";
import { patch } from "./reconciliation";

export const bind = (container: HTMLElement) => {
  let vdom: undefined | ParsedWuNode = undefined;

  return {
    unmount: () => {
      if (!vdom) {
        return;
      }

      destroy(vdom);
    },
    create: <S>({
      state: originalState,
      reducer,
      view,
    }: CreateAppParams<S>) => {
      let state = originalState;
      const dispatcher = new Dispatcher();

      // Register reducer
      Object.entries(reducer).forEach(([eventName, handler]) =>
        dispatcher.on(eventName, (payload: any) => {
          state = handler(state, payload);
        }),
      );

      const render = () => {
        if (!vdom) {
          container.appendChild(
            renderToDOM((vdom = prepare(view(state, dispatcher.emit)))),
          );
          return;
        }

        patch(vdom, (vdom = prepare(view(state, dispatcher.emit))));
      };

      dispatcher.run(render);

      render();
    },
  };
};

interface CreateAppParams<T> {
  state: T;
  reducer: Reducer<T>;
  view: (
    state: T,
    emit: (eventName: string, payload?: any) => void,
  ) => JSX.Element;
}

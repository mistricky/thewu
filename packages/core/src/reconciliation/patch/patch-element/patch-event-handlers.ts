import { Handler, Handlers } from "../../../jsx";
import { diffObjects } from "../../diff";

const replaceEventListener = (
  el: HTMLElement,
  eventName: string,
  oldListener: Handler,
  newListener: Handler,
) => {
  el.removeEventListener(eventName, oldListener);
  el.addEventListener(eventName, newListener);
};

export const patchEventListeners = (
  oldElement: HTMLElement,
  oldListeners: Handlers,
  newListeners: Handlers,
) => {
  const { added, updated, removed } = diffObjects(oldListeners, newListeners);

  added.forEach((name) =>
    oldElement.addEventListener(name, newListeners[name]),
  );
  updated.forEach((name) =>
    replaceEventListener(
      oldElement,
      name,
      oldListeners[name],
      newListeners[name],
    ),
  );
  removed.forEach((name) =>
    oldElement.removeEventListener(name, oldListeners[name]),
  );
};

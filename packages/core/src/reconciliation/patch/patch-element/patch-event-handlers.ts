import { Handlers } from "../../../jsx";
import { setEventListener } from "../../../utils";
import { diffObjects } from "../../diff";

export const patchEventListeners = (
  oldElement: HTMLElement,
  oldListeners: Handlers,
  newListeners: Handlers,
) => {
  const { added, updated, removed } = diffObjects(oldListeners, newListeners);

  updated
    .concat(added)
    .forEach((name) => setEventListener(oldElement, name, newListeners[name]));

  removed.forEach((name) =>
    oldElement.removeEventListener(name, oldListeners[name]),
  );
};

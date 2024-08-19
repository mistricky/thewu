import { getActuallyEventHandlerName, isEventHandler } from "./pure";

// Separate handlers from props, and parse the handler name which follow react handler name convention to valid DOM event name
export const separateHandlersAndProps = (props: Record<string, any>) =>
  Object.keys(props).reduce(
    (total, key) => {
      const result = isEventHandler(key)
        ? {
            handlers: {
              [getActuallyEventHandlerName(key)]: props[key],
              ...total.handlers,
            },
          }
        : { attrs: { [key]: props[key], ...total.attrs } };

      return {
        ...total,
        ...result,
      };
    },
    { attrs: {}, handlers: {} },
  );

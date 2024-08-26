import { Handler } from "../jsx";

// Use this function to set event listeners, it will replace the old event listener
export const setEventListener = (
  element: unknown,
  eventName: string,
  callback: Handler,
) => {
  const parsedEventName = `on${eventName}`;

  (element as Record<string, Handler>)[parsedEventName] = callback;
};

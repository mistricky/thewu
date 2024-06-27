export const insert = (
  el: HTMLElement | Text,
  container: HTMLElement,
  position?: number,
) => {
  // If no position was provided, just append el as child
  if (!position) {
    container.appendChild(el);
    return;
  }

  if (position < 0) {
    throw new Error("The position must be positive integer");
  }

  const { childNodes } = container;

  if (position >= childNodes.length) {
    container.appendChild(el);
    return;
  }

  container.insertBefore(el, childNodes[position]);
};

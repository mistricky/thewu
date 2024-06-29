import { BrowserRenderer } from "./renderer";

export const bind = (element: any, container: HTMLElement) => {
  // container.appendChild(renderToDOM(prepare(element)));
  const renderer = new BrowserRenderer();

  renderer.mount(element, container);
  console.info(element);
};

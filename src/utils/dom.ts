export function parseDom2String(dom: HTMLElement) {
  const stubEle = document.createElement('div');

  stubEle.appendChild(dom);

  return stubEle.innerHTML;
}

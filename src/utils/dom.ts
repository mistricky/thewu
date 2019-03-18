import { ROOT_ELEMENT_ID } from '../core/constant';

export function replace(originEle: HTMLElement, targetEle: HTMLElement) {
  let parent = originEle.parentElement;

  if (!parent) {
    parent = document.getElementById(ROOT_ELEMENT_ID)!;
  }

  parent.replaceChild(targetEle, originEle);
}

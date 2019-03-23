import { ROOT_ELEMENT_ID } from '../core/constant';
import { VdomNode } from '../core';

function getParentNode(dom: HTMLElement | Node): HTMLElement {
  let parent = dom.parentElement;

  if (!parent) {
    parent = document.getElementById(ROOT_ELEMENT_ID)!;
  }

  return parent;
}

export function replace(originEle: HTMLElement, targetEle: HTMLElement) {
  let parent = getParentNode(targetEle);

  parent.replaceChild(targetEle, originEle);
}

export function add(
  originEle: HTMLElement | Node,
  targetIndex: number,
  targets: VdomNode[]
) {
  let parent = getParentNode(originEle);
  let child = parent.children[targetIndex + 1];

  for (let target of targets) {
    let targetEl = target.el;

    if (!targetEl) {
      continue;
    }

    parent.insertBefore(targetEl.cloneNode(true), child);
  }
}

export function remove(originEle: HTMLElement | Node, targetIndex: number[]) {
  let parent = getParentNode(originEle);
  let children = parent.children;
  let stashChildren = [];

  // 为了防止下标变换
  for (let index of targetIndex) {
    stashChildren.push(children[index]);
  }

  for (let child of stashChildren) {
    // console.info(child);
    parent.removeChild(child);
  }
}

export function move(
  originEle: HTMLElement | Node,
  originIndex: number,
  targetIndex: number
) {
  let parent = getParentNode(originEle);
  let children = parent.children;
  let originChild = children[originIndex];
  let targetChild = children[targetIndex];

  parent.insertBefore(originChild, targetChild);
  parent.removeChild(targetChild);
}

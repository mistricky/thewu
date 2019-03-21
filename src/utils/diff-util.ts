import {
  Operation,
  MovePayload,
  RemovePayload,
  AddPayload
} from '../core/diff/operation';
import { Vdom, ElementChildren, ElementChild, _Element, Attrs } from '../core';

export type Payloads<T> = MovePayload | RemovePayload | AddPayload<T>;

export interface Group<T> {
  [index: string]: Payloads<T>[];
}

export function groupByOperation(originArr: Operation[]): Group<unknown> {
  return originArr.reduce((total: Group<unknown>, val: Operation) => {
    total[val.name] = (total[val.name] || []).concat(val.payload);

    return total;
  }, {});
}

export function filterUndefined<T>(layer: T[]): T[] {
  return layer.filter((node, index) => (index === 0 && node) || node);
}

// insert method of array
export function insert<T>(arr: T[], index: number, ...item: T[]): T[] {
  let duplicate = arr.slice();

  duplicate.splice(index + 1, 0, ...item);

  return duplicate;
}

export function move<T>(
  arr: (T | undefined)[],
  originIndex: number,
  targetIndex: number
) {
  let duplicate = arr.slice();

  duplicate[originIndex] = undefined;
  duplicate = insert(duplicate, targetIndex, arr[originIndex]);

  return filterUndefined(duplicate);
}

export function remove<T>(arr: (T | undefined)[], ...indexes: number[]) {
  let duplicate = arr.slice();

  for (let index of indexes) {
    duplicate[index] = undefined;
  }

  return filterUndefined(duplicate);
}

export function getLayerOfVdom(vdom: Vdom, layer: number): ElementChildren {
  if (layer === 0) {
    return [vdom];
  }

  let result: ElementChildren = [];
  let targetNode: Vdom | ElementChild = vdom;

  for (let i = 0; i < layer - 1; i++) {
    if ((targetNode as Vdom).children) {
      targetNode = (targetNode as Vdom).children[0];
    }
  }

  if (targetNode) {
    result.push(...(targetNode as _Element).children);
    let nextSibling = (targetNode as Vdom).nextSibling;

    while (nextSibling) {
      result.push(...(nextSibling as _Element).children);
      nextSibling = nextSibling.nextSibling;
    }
  }

  return result;
}

export function isPropsChange(oldAttrs: Attrs, newAttrs: Attrs): boolean {
  for (let attr of Object.keys(newAttrs)) {
    if (oldAttrs[attr].toString() !== newAttrs[attr].toString()) {
      return true;
    }
  }

  return false;
}

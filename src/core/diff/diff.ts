import { Operation, OPERATIONS, move, add, remove } from './operation';
import { insert, typeOf, isPropsChange } from '../../utils';
import { VdomNode } from '../renderer';
import { ElementChild, _Element } from '../element';
import { DATA_TYPE } from '../data-types';

export type LayerNode = VdomNode | undefined | null | ElementChild | string;

export type VdomNodeLayer = LayerNode[];

export interface UpdateIndexTuple {
  isDone: boolean;
  value: number;
}

export function diff(oldVdom: VdomNodeLayer, newVdom: VdomNodeLayer) {
  let oldStart = 0,
    oldEnd = oldVdom.length - 1,
    newStart = 0,
    newEnd = newVdom.length - 1;

  let oldVdomDuplicate =
    typeOf(oldVdom) === DATA_TYPE.STRING ? oldVdom : [...oldVdom];

  return compare(
    oldStart,
    oldEnd,
    newStart,
    newEnd,
    oldVdomDuplicate,
    newVdom,
    []
  );
}

export function compare(
  oldStart: number,
  oldEnd: number,
  newStart: number,
  newEnd: number,
  oldVdom: VdomNodeLayer,
  newVdom: VdomNodeLayer,
  operations: Operation<OPERATIONS>[]
): Operation<OPERATIONS>[] {
  if (oldStart > oldEnd || newStart > newEnd) {
    // is add
    if (newStart <= newEnd) {
      let waitAddItems = newVdom.slice(newStart, newEnd + 1);
      oldVdom = insert(
        oldVdom,
        oldEnd,
        ...waitAddItems.slice().map(() => null)
      );
      operations = add(operations, oldEnd, waitAddItems);
    }

    // is remove
    if (oldStart <= oldEnd) {
      operations = remove(operations, oldVdom, oldStart, oldEnd);
    }

    return operations;
  }

  // compare start and end
  if (compareNode(oldVdom[oldStart], newVdom[newStart])) {
    oldStart++;
    newStart++;

    return compare(
      oldStart,
      oldEnd,
      newStart,
      newEnd,
      oldVdom,
      newVdom,
      operations
    );
  }

  if (compareNode(oldVdom[oldEnd], newVdom[newEnd])) {
    oldEnd--;
    newEnd--;

    return compare(
      oldStart,
      oldEnd,
      newStart,
      newEnd,
      oldVdom,
      newVdom,
      operations
    );
  }

  let hasNewStartNode = true;
  let hasNewEndNode = true;

  // filter node that missing in oldVdom
  for (let cursor = oldStart; cursor <= oldEnd; cursor++) {
    let node = oldVdom[cursor];

    if (compareNode(node, newVdom[newStart])) {
      hasNewStartNode = false;
    }

    if (compareNode(node, newVdom[newEnd])) {
      hasNewEndNode = false;
    }
  }

  // filter only one new element condition
  if (newStart === newEnd && hasNewEndNode && hasNewStartNode) {
    hasNewEndNode = false;
  }

  if (hasNewEndNode || hasNewStartNode) {
    // parse traverse result
    if (hasNewEndNode) {
      operations = add(operations, oldEnd, newVdom[newEnd]);
      newEnd--;

      oldVdom.push(null);
    }

    if (hasNewStartNode) {
      operations = add(operations, oldStart - 1, newVdom[newStart]);
      newStart++;

      oldVdom.unshift(null);
      oldStart++;
      oldEnd++;
    }

    return compare(
      oldStart,
      oldEnd,
      newStart,
      newEnd,
      oldVdom,
      newVdom,
      operations
    );
  }

  for (let cursor = oldStart; cursor <= oldEnd; cursor++) {
    // move node to start of layer
    if (compareNode(oldVdom[cursor], newVdom[newStart])) {
      operations = move(operations, oldVdom, cursor, oldStart - 1);
      oldVdom[cursor] = undefined;
      newStart++;

      oldVdom.unshift(null);
      oldStart++; // is add
      oldEnd++;

      // is last element
      if (cursor === oldEnd) {
        oldEnd--;
      }

      break;
    }

    // move node to end of layer
    if (compareNode(oldVdom[cursor], newVdom[newEnd])) {
      operations = move(operations, oldVdom, cursor, oldEnd);
      oldVdom[cursor] = undefined;
      newEnd--;

      oldVdom.push(null);

      // is start element
      if (cursor === oldStart) {
        oldStart++;
      }

      break;
    }
  }

  return compare(
    oldStart,
    oldEnd,
    newStart,
    newEnd,
    oldVdom,
    newVdom,
    operations
  );
}

function compareNode(oldVdom: LayerNode, newVdom: LayerNode) {
  if (!oldVdom || !newVdom) {
    return true;
  }

  // 元素或者字符串相等 元素的 attrs 做对比 && 元素的 tagName 对比
  if (
    (typeOf(oldVdom) !== DATA_TYPE.STRING &&
      typeOf(newVdom) !== DATA_TYPE.STRING &&
      (oldVdom as _Element).tagName === (newVdom as _Element).tagName &&
      !isPropsChange(
        (oldVdom as VdomNode).attrs,
        (newVdom as VdomNode).attrs
      )) ||
    oldVdom === newVdom
  ) {
    return true;
  }

  return false;
}

import { VdomNodeLayer, LayerNode } from './diff';
import { filterUndefined } from '../../utils';
import { VdomNode } from '../renderer';

export type OPERATIONS = 'move' | 'add' | 'remove';

export interface MovePayload {
  layerDom: HTMLElement;
  originIndex: number;
  targetIndex: number;
}

export interface AddPayload<T> {
  layerDom: HTMLElement;
  targetIndex: number;
  targets: T[];
}

export interface RemovePayload {
  layerDom: HTMLElement;
  targetIndexes: number[];
}

export interface Operation<
  T extends OPERATIONS = OPERATIONS,
  AddTarget = unknown
> {
  name: T;
  payload: T extends 'move'
    ? MovePayload
    : T extends 'replace' | 'add'
    ? AddPayload<AddTarget>
    : RemovePayload;
}

function duplicatePush(
  operations: Operation<OPERATIONS>[],
  operation: Operation
) {
  let duplicate = operations.slice();
  duplicate.push(operation);

  return duplicate;
}

export function add<T = VdomNode>(
  operations: Operation<OPERATIONS, T>[],
  vdomNode: LayerNode[],
  targetIndex: number,
  ...targets: T[]
) {
  let nodes = targets.filter(node => node);

  if (!nodes.length) {
    return operations;
  }

  return duplicatePush(operations, {
    name: 'add',
    payload: {
      targetIndex,
      targets: [].concat(...(targets as any)),
      layerDom: (vdomNode[targetIndex] as VdomNode).el!
    }
  });
}

export function remove(
  operations: Operation<OPERATIONS>[],
  vdomNode: VdomNodeLayer,
  sliceStart: number,
  sliceEnd: number
) {
  let count = 0;
  let indexes = vdomNode.map((node, index) => {
    if (index >= sliceStart && index <= sliceEnd) {
      if (node === undefined) {
        count++;
      } else {
        return index - count;
      }
    } else {
      return null;
    }
  });

  indexes = filterUndefined(indexes);

  if (!indexes.length) {
    return operations;
  }

  return duplicatePush(operations, {
    name: 'remove',
    payload: {
      targetIndexes: [].concat(...(indexes as any)),
      layerDom: (vdomNode[indexes[0] as number] as VdomNode).el!
    }
  });
}

export function move(
  operations: Operation<OPERATIONS>[],
  vdomNode: VdomNodeLayer,
  originIndex: number,
  targetIndex: number
) {
  let undefineds = 0;

  const OPERATE_METHODS = {
    [originIndex]: () => (originIndex -= undefineds),
    [targetIndex]: () => (targetIndex -= undefineds)
  };

  for (let index of Object.keys(vdomNode)) {
    let operationFunc = OPERATE_METHODS[+index];

    if (operationFunc) {
      operationFunc();
      continue;
    }

    if (vdomNode[+index] === undefined) {
      undefineds++;
    }
  }

  return duplicatePush(operations, {
    name: 'move',
    payload: {
      targetIndex,
      originIndex,
      layerDom: (vdomNode[originIndex] as VdomNode).el!
    }
  });
}

import { VdomNodeLayer } from './diff';
import { filterUndefined } from '../../utils';
import { VdomNode } from '../renderer';

export type OPERATIONS = 'move' | 'add' | 'remove';

export interface MovePayload {
  originIndex: number;
  targetIndex: number;
}

export interface AddPayload<T> {
  targetIndex: number;
  targets: T[];
}

export interface RemovePayload {
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
  targetIndex: number,
  ...targets: T[]
) {
  let nodes = targets.filter(node => node);

  if (!nodes.length) {
    return operations;
  }

  return duplicatePush(operations, {
    name: 'add',
    payload: { targetIndex, targets: [].concat(...(targets as any)) }
  });
}

export function remove(
  operations: Operation<OPERATIONS>[],
  oldVdom: VdomNodeLayer,
  sliceStart: number,
  sliceEnd: number
) {
  let count = 0;
  let indexes = oldVdom.map((node, index) => {
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
    payload: { targetIndexes: [].concat(...(indexes as any)) }
  });
}

export function move(
  operations: Operation<OPERATIONS>[],
  VdomNode: VdomNodeLayer,
  originIndex: number,
  targetIndex: number
) {
  let undefineds = 0;

  const OPERATE_METHODS = {
    [originIndex]: () => (originIndex -= undefineds),
    [targetIndex]: () => (targetIndex -= undefineds)
  };

  for (let index of Object.keys(VdomNode)) {
    let operationFunc = OPERATE_METHODS[+index];

    if (operationFunc) {
      operationFunc();
      continue;
    }

    if (VdomNode[+index] === undefined) {
      undefineds++;
    }
  }

  return duplicatePush(operations, {
    name: 'move',
    payload: { targetIndex, originIndex }
  });
}

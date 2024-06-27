export enum Operator {
  ADD,
  REMOVE,
  MOVE,
  NOPE,
}

export interface DiffSequenceResultItem<T> {
  operator: Operator;
  position: number;
  // If the operator is MOVE, the originPosition shouldn't be undefined
  originPosition?: number;
  item: T;
}

type CompareFunction<T> = (a: T, b: T) => boolean;

export type DiffSequenceResult<T> = DiffSequenceResultItem<T>[];

const includesWithCompare = <T>(
  array: T[],
  targetItem: T,
  compare: CompareFunction<T>,
) => array.some((item) => compare(item, targetItem));

export const diffSequence = <T>(
  oldArray: T[],
  newArray: T[],
  compare: CompareFunction<T> = (a, b) => a === b,
): DiffSequenceResult<T> => {
  let i = 0;
  let result: DiffSequenceResult<T> = [];

  while (i < newArray.length) {
    const oldItem = oldArray[i];
    const newItem = newArray[i];

    // If old item does not exists in new array, that represent the old item
    // was deleted in new array
    if (oldItem && !includesWithCompare(newArray, oldItem, compare)) {
      result.push({ operator: Operator.REMOVE, position: i, item: oldItem });
      oldArray.splice(i, 1);
      continue;
    }

    // If old item is equal to new item, do nothing
    if (compare(oldItem, newItem)) {
      result.push({ operator: Operator.NOPE, position: i++, item: newItem });
      continue;
    }

    // If the new item does not exists in old array, that represent the item is new,
    // should be add in the original array
    if (newItem && !includesWithCompare(oldArray, newItem, compare)) {
      oldArray.splice(i, 0, newItem);
      result.push({ operator: Operator.ADD, item: newItem, position: i++ });
      continue;
    }

    // If the new item exists in old array, that represent the item was moved
    const originPosition = oldArray.findIndex((item) => compare(newItem, item));
    const position = i++;

    // The move manner is to remove the item from the old position
    // and insert it in the new position
    oldArray.splice(originPosition, 1);
    oldArray.splice(position, 0, newItem);

    result.push({
      operator: Operator.MOVE,
      originPosition,
      position,
      item: newItem,
    });
  }

  // Remove all remaining items from oldArray
  result = result.concat(
    oldArray.slice(newArray.length).map((item) => ({
      operator: Operator.REMOVE,
      position: i,
      item,
    })),
  );

  return result;
};

import { ParsedWuNode, insert, renderToDOM } from "../../../utils";
import {
  DiffSequenceResult,
  DiffSequenceResultItem,
  Operator,
  diffSequence,
} from "../../diff";
import { areNodesEqual } from "../equal";
import { patch } from "../patch";

type Actions<T> = Record<Operator, (item: DiffSequenceResultItem<T>) => void>;

const createActions = <T extends ParsedWuNode>(
  parentEl: HTMLElement,
  oldChildren: ParsedWuNode[],
): Actions<T> => ({
  [Operator.ADD]: ({ position, item }) =>
    insert(renderToDOM(item), parentEl, position),
  [Operator.REMOVE]: ({ item }) => item.el.remove(),
  [Operator.NOPE]: ({ position, item }) => patch(oldChildren[position], item),
  [Operator.MOVE]: ({ position, originPosition, item: newChild }) => {
    const oldChild = oldChildren[originPosition!];

    oldChild.el.remove();
    insert(renderToDOM(newChild), parentEl, position);

    patch(oldChild, newChild);
  },
});

export const patchChildren = (
  parentEl: HTMLElement,
  oldChildren: ParsedWuNode[],
  newChildren: ParsedWuNode[],
) => {
  const actions = createActions<ParsedWuNode>(parentEl, oldChildren);

  for (const diffResultItem of diffSequence(
    oldChildren,
    newChildren,
    areNodesEqual,
  )) {
    actions[diffResultItem.operator](diffResultItem);
  }
};

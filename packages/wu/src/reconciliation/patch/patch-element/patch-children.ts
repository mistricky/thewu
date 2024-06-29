import { ParsedWuNode } from "../../../initialize";
import { WuNode } from "../../../jsx";
import { Renderer } from "../../../renderer";
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
  renderer: Renderer
): Actions<T> => ({
  [Operator.ADD]: ({ position, item }) =>
    renderer.insertNode(item, parentEl, position),
  [Operator.REMOVE]: ({ item }) => renderer.removeNode(item as ParsedWuNode),
  [Operator.NOPE]: ({ position, item }) =>
    patch(oldChildren[position], item, renderer),
  [Operator.MOVE]: ({ position, originPosition, item: newChild }) => {
    const oldChild = oldChildren[originPosition!];

    renderer.removeNode(oldChild);
    renderer.insertNode(newChild, parentEl, position);

    patch(oldChild, newChild, renderer);
  },
});

export const patchChildren = (
  parentEl: HTMLElement,
  oldChildren: ParsedWuNode["children"],
  newChildren: ParsedWuNode["children"],
  renderer: Renderer
) => {
  const actions = createActions<ParsedWuNode>(parentEl, oldChildren, renderer);

  for (const diffResultItem of diffSequence(
    oldChildren,
    newChildren,
    areNodesEqual
  )) {
    actions[diffResultItem.operator](diffResultItem);
  }
};

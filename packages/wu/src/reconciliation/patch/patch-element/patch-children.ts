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
  renderer: Renderer,
): Actions<T> => ({
  [Operator.ADD]: ({ position, item }) => {
    item.parentNode!.el = parentEl;
    item.parentEl = parentEl;

    renderer.insertNode(item, parentEl, position);

    // if (item.parentNode?.el) {
    //   item.parentNode.el = oldChildren[position].parentEl;
    // }
  },
  [Operator.REMOVE]: ({ item }) => renderer.removeNode(item as ParsedWuNode),
  [Operator.NOPE]: ({ position, item }) => {
    item.el = oldChildren[position].el;
    item.parentEl = oldChildren[position].parentEl;
    item.parentNode = oldChildren[position].parentNode;

    patch(oldChildren[position], item, renderer);
  },
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
  renderer: Renderer,
) => {
  const actions = createActions<ParsedWuNode>(parentEl, oldChildren, renderer);
  const diffResult = diffSequence(oldChildren, newChildren, areNodesEqual);

  for (const diffResultItem of diffResult) {
    actions[diffResultItem.operator](diffResultItem);
  }
};

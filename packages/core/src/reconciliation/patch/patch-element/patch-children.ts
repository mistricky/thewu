import { ParsedWuNode } from "../../../initialize";
import { Renderer } from "../../../renderer";
import { applyWithFragmentType, updateParentEl } from "../../../utils";
import { DiffSequenceResultItem, Operator, diffSequence } from "../../diff";
import { areNodesEqual } from "../equal";
import { patch } from "../patch";

type Actions<T> = Record<Operator, (item: DiffSequenceResultItem<T>) => void>;

const createActions = <T extends ParsedWuNode>(
  parentEl: HTMLElement,
  oldChildren: ParsedWuNode[],
  renderer: Renderer,
): Actions<T> => ({
  [Operator.ADD]: ({ position, item }) => {
    const insertNode = applyWithFragmentType(renderer.insertNode);

    updateParentEl(item, parentEl);
    insertNode(item, parentEl, position);
  },
  [Operator.REMOVE]: ({ item }) => {
    const removeNode = applyWithFragmentType(renderer.removeNode);

    removeNode(item);
  },
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

import {
  DiffSequenceResult,
  DiffSequenceResultItem,
  Operator,
  diffSequence,
} from "../../../src/reconciliation";

type Actions<T> = Record<Operator, (item: DiffSequenceResultItem<T>) => void>;

const applyDiff = <T>(oldArray: T[], diffActions: DiffSequenceResult<T>) => {
  const mutOldArray = oldArray.slice();
  const actions: Actions<T> = {
    [Operator.ADD]: ({ position, item }) =>
      mutOldArray.splice(position, 0, item),
    [Operator.REMOVE]: ({ position }) => mutOldArray.splice(position, 1),
    [Operator.NOPE]: () => {},
    [Operator.MOVE]: ({ originPosition, position, item }) => {
      mutOldArray.splice(originPosition!, 1);
      mutOldArray.splice(position, 0, item);
    },
  };

  for (const item of diffActions) {
    actions[item.operator](item);
  }

  return mutOldArray;
};

describe("Diff two sequence", () => {
  it("Should equal to new array after apply diff result", () => {
    expect(
      applyDiff(
        ["X", "A", "A", "B", "C"],
        diffSequence(["X", "A", "A", "B", "C"], ["C", "K", "A", "B"]),
      ),
    ).toEqual(["C", "K", "A", "B"]);
  });
});

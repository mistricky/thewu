import { Operator, diffSequence, } from "../../../src/reconciliation";
const applyDiff = (oldArray, diffActions) => {
    const mutOldArray = oldArray.slice();
    const actions = {
        [Operator.ADD]: ({ position, item }) => mutOldArray.splice(position, 0, item),
        [Operator.REMOVE]: ({ position }) => mutOldArray.splice(position, 1),
        [Operator.NOPE]: () => { },
        [Operator.MOVE]: ({ originPosition, position, item }) => {
            mutOldArray.splice(originPosition, 1);
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
        expect(applyDiff(["X", "A", "A", "B", "C"], diffSequence(["X", "A", "A", "B", "C"], ["C", "K", "A", "B"]))).toEqual(["C", "K", "A", "B"]);
    });
});

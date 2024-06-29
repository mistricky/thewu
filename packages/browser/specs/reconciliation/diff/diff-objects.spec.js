import { diffObjects } from "../../../src/reconciliation";
describe("Diff two objects", () => {
    it("Should return correct added keys between two objects", () => {
        expect(diffObjects({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3, d: 4 }).added[0]).toBe("d");
        expect(diffObjects({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, e: 5, c: 3, d: 4 }).added).toEqual(expect.arrayContaining(["e", "d"]));
    });
    it("Should return correct removed keys between two objects", () => {
        expect(diffObjects({ a: 1, b: 2, c: 3 }, { a: 1 }).removed).toEqual(expect.arrayContaining(["b", "c"]));
        expect(diffObjects({ a: 1, b: 2, c: 3 }, { c: 1 }).removed).toEqual(expect.arrayContaining(["a", "b"]));
    });
    it("Should return correct updated keys between two objects", () => {
        expect(diffObjects({ a: 1, b: 2, c: 3 }, { a: 1, b: 3, c: 4 }).updated).toEqual(expect.arrayContaining(["b", "c"]));
        expect(diffObjects({ a: 1, b: 2, c: 3 }, { a: 2, b: 3, c: 4 }).updated).toEqual(expect.arrayContaining(["a", "b", "c"]));
    });
    it("Should return correct updated, removed, added keys between two objects", () => {
        const result = diffObjects({ a: 1, b: 2, c: 3 }, { a: 1, e: 6, c: 4, d: 5 });
        expect(result.updated).toEqual(expect.arrayContaining(["c"]));
        expect(result.added).toEqual(expect.arrayContaining(["e", "d"]));
        expect(result.removed).toEqual(expect.arrayContaining(["b"]));
    });
});

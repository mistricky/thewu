import { dependenceManager } from "../src/dependence-manager";
import { reactive } from "../src/reactive";

describe("Reactive function", () => {
  it("should create a reactive object without options", () => {
    const obj = { a: 1 };
    const reactiveObj = reactive(obj);
    expect(reactiveObj.a).toBe(1);
  });

  it("should reflect changes in the reactive object", () => {
    const obj = { a: 1 };
    const reactiveObj = reactive(obj);
    reactiveObj.a = 2;
    expect(reactiveObj.a).toBe(2);
  });

  it("should trigger dependency collection on property access", () => {
    const obj = { a: 1 };
    const reactiveObj = reactive(obj);
    const spy = jest.spyOn(dependenceManager, "collect");
    reactiveObj.a;
    expect(spy).toHaveBeenCalledWith(expect.anything(), "a", 1);
    spy.mockRestore();
  });

  it("should trigger dependency triggers on property set", () => {
    const obj = { a: 1 };
    const reactiveObj = reactive(obj);
    const spy = jest.spyOn(dependenceManager, "trigger");
    reactiveObj.a = 2;
    expect(spy).toHaveBeenCalledWith(expect.anything(), "a", 2);
    spy.mockRestore();
  });

  it("should not handle nested objects if recursion option is false", () => {
    const spy = jest.spyOn(dependenceManager, "collect");

    expect(spy).not.toHaveBeenCalledWith(expect.anything(), "a", 1);
    spy.mockRestore();
  });
});

import { stream, reactive } from "../src";

describe("Stream function", () => {
  it("Should call the reactFunction only if the return value of computedFunction has changed", () => {
    const foo = reactive({ bar: 1 });
    const subscriptionFunction = jest.fn();

    stream(() => foo.bar, subscriptionFunction);

    foo.bar = 2; // Change the value to trigger the function
    foo.bar = 3; // Change again to test continuous updates

    expect(subscriptionFunction).toHaveBeenCalledTimes(2);
  });

  it("Should not call the reactFunction if the return value of computedFunction has not changed", () => {
    const foo = reactive({ bar: 1 });
    const subscriptionFunction = jest.fn();

    stream(() => foo.bar, subscriptionFunction);

    foo.bar = 1; // No change should not trigger the function
    foo.bar = 1; // Repeated no change should also not trigger

    expect(subscriptionFunction).toHaveBeenCalledTimes(0);
  });

  it("Should handle multiple subscribers to the same reactive property", () => {
    const foo = reactive({ bar: 1 });
    const firstFunction = jest.fn();
    const secondFunction = jest.fn();

    stream(() => foo.bar, firstFunction);
    stream(() => foo.bar, secondFunction);

    foo.bar = 2; // Change should trigger both functions

    expect(firstFunction).toHaveBeenCalledTimes(1);
    expect(secondFunction).toHaveBeenCalledTimes(1);
  });

  it("Should not interfere with unrelated reactive properties", () => {
    const foo = reactive({ bar: 1, baz: 1 });
    const subscriptionFunction = jest.fn();

    stream(() => foo.bar, subscriptionFunction);

    foo.baz = 2; // Change an unrelated property

    expect(subscriptionFunction).toHaveBeenCalledTimes(0);
  });
});

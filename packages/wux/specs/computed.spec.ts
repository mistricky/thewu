import { reactive } from "../src/reactive";
import { computed } from "../src/computed";
import { subscribe } from "../src/subscription";

describe("Computed", () => {
  it("Should call the computed function only once when the dependency does not change", () => {
    const memoedFunction = () => {};
    const foo = reactive({ bar: memoedFunction });
    const computedFunction = jest.fn(() => foo.bar);
    const computedValue = computed(computedFunction);

    subscribe(() => computedValue.value);

    foo.bar = memoedFunction; // No actual change in dependency

    expect(computedFunction).toHaveBeenCalledTimes(1);
  });

  it("Should call the computed function twice when the dependency changes", () => {
    const foo = reactive({ bar: 1 });
    const computedFunction = jest.fn(() => foo.bar);
    const computedValue = computed(computedFunction);

    subscribe(() => computedValue.value);

    foo.bar = 2; // Change in dependency

    expect(computedFunction).toHaveBeenCalledTimes(2);
  });

  it("Should not call the computed function when unrelated data changes", () => {
    const foo = reactive({ bar: 1, baz: 10 });
    const computedFunction = jest.fn(() => foo.bar);
    const computedValue = computed(computedFunction);

    subscribe(() => computedValue.value);

    foo.baz = 20; // Change in unrelated data

    expect(computedFunction).toHaveBeenCalledTimes(1);
  });

  it("Should call the computed function once initially and not again if the dependency remains unchanged", () => {
    const foo = reactive({ bar: 1 });
    const computedFunction = jest.fn(() => foo.bar);
    const computedValue = computed(computedFunction);

    subscribe(() => computedValue.value);
    subscribe(() => computedValue.value); // Multiple subscriptions without change

    expect(computedFunction).toHaveBeenCalledTimes(1);
  });

  it("Should handle multiple dependencies correctly", () => {
    const foo = reactive({ bar: 1, baz: 5 });
    const computedFunction = jest.fn(() => foo.bar + foo.baz);
    const computedValue = computed(computedFunction);

    subscribe(() => computedValue.value);

    foo.bar = 2; // Change in one of the dependencies
    foo.baz = 6; // Another change in one of the dependencies

    expect(computedFunction).toHaveBeenCalledTimes(3); // Initial + two changes
  });
});

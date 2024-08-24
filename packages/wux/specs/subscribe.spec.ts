import { reactive, subscribe } from "..";

describe("Subscribe function", () => {
  it("Should call the watcher function once when call subscribe function immediately", () => {
    const watcher = jest.fn();

    subscribe(watcher);
    expect(watcher).toHaveBeenCalledTimes(1);
  });

  it("Should call the watcher function when the state was changed", () => {
    const foo = reactive({ bar: 1 });
    const watcher = jest.fn(() => foo.bar);

    subscribe(watcher);

    foo.bar = 2;

    expect(watcher).toHaveBeenCalledTimes(2);
  });

  it("Should not call the watcher function when an unrelated state changes", () => {
    const foo = reactive({ bar: 1, baz: 10 });
    const watcher = jest.fn(() => foo.bar);

    subscribe(watcher);

    foo.baz = 20;

    expect(watcher).toHaveBeenCalledTimes(1);
  });

  it("Should handle multiple state changes", () => {
    const foo = reactive({ bar: 1 });
    const watcher = jest.fn(() => foo.bar);

    subscribe(watcher);

    foo.bar = 2;
    foo.bar = 3;

    expect(watcher).toHaveBeenCalledTimes(3);
  });

  it("Should call the watcher even if the state value set is the same as the current", () => {
    const foo = reactive({ bar: 1 });
    const watcher = jest.fn(() => foo.bar);

    subscribe(watcher);

    foo.bar = 1;

    expect(watcher).toHaveBeenCalledTimes(2);
  });
});

import { DependenceManager, Watcher } from "../src/dependence-manager";

describe("Dependence Manager", () => {
  let dm: DependenceManager;

  beforeEach(() => {
    dm = new DependenceManager();
  });

  describe("nextId", () => {
    it("Should generate a unique observer ID each time it is called", () => {
      const id1 = dm.nextId;
      const id2 = dm.nextId;

      expect(id1).not.toEqual(id2);
    });
  });

  describe("collect", () => {
    it("Should collect watchers under the given ID", () => {
      const watcher: Watcher = jest.fn();
      const id = dm.nextId;

      dm.addWatcher(watcher);
      dm.collect(id);

      expect(dm["store"][id]).toContain(watcher);
    });

    it("Should not collect watchers if none are added", () => {
      const id = dm.nextId;

      dm.collect(id);

      expect(dm["store"][id]).toEqual([]);
    });
  });

  describe("trigger", () => {
    it("Should call all watchers associated with the given ID", () => {
      const watcher: Watcher = jest.fn();
      const id = dm.nextId;

      dm.addWatcher(watcher);
      dm.collect(id);
      dm.trigger(id);

      expect(watcher).toHaveBeenCalled();
    });

    it("Should not fail if there are no watchers for a given ID", () => {
      const id = dm.nextId;

      expect(() => dm.trigger(id)).not.toThrow();
    });
  });

  describe("addWatcher", () => {
    it("Should add a watcher to the list of watchers", () => {
      const watcher: Watcher = jest.fn();

      dm.addWatcher(watcher);

      expect(dm["watchers"]).toContain(watcher);
    });
  });
});

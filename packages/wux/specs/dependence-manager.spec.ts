import { DependenceManager } from "../src/dependence-manager";

describe("Dependence Manager", () => {
  let dm: DependenceManager;

  beforeEach(() => {
    dm = new DependenceManager();
  });

  describe("Initialization", () => {
    it("should initialize with no watchers", () => {
      expect(dm["watchers"]).toEqual([]);
    });

    it("should initialize with an empty store", () => {
      expect(dm["store"]).toEqual({});
    });

    it("should initialize with empty states", () => {
      expect(dm["states"]).toEqual({});
    });
  });

  describe("nextId", () => {
    it("should generate unique ids", () => {
      const id1 = dm.nextId;
      const id2 = dm.nextId;
      expect(id1).not.toEqual(id2);
    });
  });

  describe("collect", () => {
    it("should collect state changes when watchers are present", () => {
      const mockWatcher = jest.fn();
      dm.addWatcher(mockWatcher);
      dm.collect("id1", "testState", 42);
      expect(dm["store"]["id1"]).toBeDefined();
      expect(dm["store"]["id1"]!.length).toBe(1);
      expect(dm["store"]["id1"]![0].stateName).toBe("testState");
      expect(dm["store"]["id1"]![0].stateValue).toBe(42);
    });

    it("should not collect state changes when no watchers are present", () => {
      dm.collect("id1", "testState", 42);
      expect(dm["store"]["id1"]).toBeUndefined();
    });
  });

  describe("trigger", () => {
    it("should trigger watchers associated with a specific state change", () => {
      const mockWatcher = jest.fn();
      dm.addWatcher(mockWatcher);
      dm.collect("id1", "testState", 42);
      dm.trigger("id1", "testState", 42);
      expect(mockWatcher).toHaveBeenCalled();
    });

    it("should not trigger watchers not associated with the state change", () => {
      const mockWatcher = jest.fn();
      dm.addWatcher(mockWatcher);
      dm.collect("id1", "testState", 42);
      dm.trigger("id1", "otherState", 100);
      expect(mockWatcher).not.toHaveBeenCalled();
    });
  });

  describe("clearStates", () => {
    it("should clear all states", () => {
      dm.collect("id1", "testState", 42);
      dm.clearStates();
      expect(dm["states"]).toEqual({});
    });
  });
});

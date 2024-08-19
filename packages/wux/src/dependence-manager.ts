export type Watcher = () => void;

export type ObserverId = string;

type Store = {
  [K in ObserverId]?: Watcher[];
};

export class DependenceManager {
  private watchers: Watcher[] = [];
  private store: Store = {};

  get nextId(): ObserverId {
    const id = `$wux_${Object.keys(this.store).length}`;

    this.store[id] = [];

    return id;
  }

  collect(id: ObserverId) {
    if (!this.watchers.length) {
      return;
    }

    this.store[id] = (this.store[id] ?? []).concat(this.watchers);
    this.watchers = [];
  }

  trigger(id: ObserverId) {
    console.info(
      id,
      this.store[id]?.map((fn) => fn.toString()),
    );
    this.store[id]?.forEach((watcher) => watcher());
  }

  addWatcher(watcher: Watcher) {
    this.watchers.push(watcher);
  }
}

export const dependenceManager = new DependenceManager();

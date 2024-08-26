export type State = {
  stateName: string;
  stateValue: unknown;
};

export type WatcherWithState = {
  watcher: Watcher;
} & State;
export type Watcher = () => void;

export type ObserverId = string;

type Store = {
  [K in ObserverId]?: WatcherWithState[];
};

export type States = Record<string, unknown>;

export class DependenceManager {
  private watchers: Watcher[] = [];
  private store: Store = {};
  private _states: States = {};

  get nextId(): ObserverId {
    const id = `$wux_${Object.keys(this.store).length}`;

    this.store[id] = [];

    return id;
  }

  get states() {
    return this._states;
  }

  collect(id: ObserverId, stateName: string, stateValue: unknown) {
    if (!this.watchers.length) {
      return;
    }

    const watchers = this.watchers.map<WatcherWithState>((watcher) => ({
      watcher,
      stateName,
      stateValue,
    }));

    this._states[stateName] = stateValue;
    this.store[id] = (this.store[id] ?? []).concat(watchers);
  }

  trigger(
    id: ObserverId,
    stateName: string,
    stateValue: unknown,
    triggerStateName?: string,
  ) {
    this._states[stateName] = stateValue;

    for (const watcherWithState of this.store[id] ?? []) {
      if ([stateName, triggerStateName].includes(watcherWithState.stateName)) {
        watcherWithState.watcher();
      }
    }

    this.clearStates();
  }

  addWatcher(watcher: Watcher) {
    this.watchers.push(watcher);
  }

  clearStates() {
    this._states = {};
  }

  clearWatchers() {
    this.watchers = [];
    this.clearStates();
  }
}

export const dependenceManager = new DependenceManager();

import { bind } from "@thewu/browser";
import { Component, Default, State } from "@thewu/core";

@Component()
class Counter {
  // @Default({ prop: "initCount" })
  @State
  count: number = 1;

  render() {
    return (
      <div>
        <p>{`Hello ${this.count}`}</p>
        <button onClick={() => this.count++}>+1</button>
      </div>
    );
  }
}

bind(<Counter initCount={10}></Counter>, document.querySelector("#container")!);

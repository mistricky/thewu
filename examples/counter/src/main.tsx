import { bind } from "@thewu/browser";
import { Component, Default, State } from "@thewu/core";

@Component()
class Counter {
  @State
  @Default({ prop: "initCount" })
  count!: number;

  render() {
    return (
      <div>
        <p>{this.count}</p>
        <button onClick={() => this.count++}>+1</button>
      </div>
    );
  }
}

bind(<Counter initCount={10}></Counter>, document.querySelector("#container")!);

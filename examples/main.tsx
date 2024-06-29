import { bind } from "@wu/browser";
import * as Wu from "@wu/core";
import { Component, Default, Prop, Props, State } from "@wu/core";

interface CounterProps {
  initCount: number;
}

@Component()
class Counter {
  @State
  @Default({ prop: "initCount" })
  count!: number;

  onMounted() {
    console.info("Hello");
  }

  render() {
    return (
      <div>
        <span>{this.count}</span>
        <button
          onClick={() => {
            console.info(this.count);
            this.count++;
          }}
        >
          +1
        </button>
      </div>
    );
  }
}

@Component()
class Foo {
  @State
  name = "foo";

  @Prop("age")
  age!: number;

  onMounted() {
    console.info("Foo");
  }

  render(): Wu.WuNode {
    return (
      <div>
        {`My name is ${this.name}, and I'm ${this.age} years old.`}
        <button
          onClick={() => {
            this.name = "bar";
          }}
        >
          change
        </button>
        <Counter initCount={10}></Counter>
      </div>
    );
  }
}

const Bar = () => (
  <div>
    bar<span>bbbbb</span>
  </div>
);

bind(
  <div>
    <Bar></Bar>
    <>
      nnnn
      <Foo age={10}></Foo>
      <div a={1} onClick={() => {}}>
        aaa
      </div>
      <span>aaaa</span>
    </>
  </div>,
  document.querySelector("#container")!,
);

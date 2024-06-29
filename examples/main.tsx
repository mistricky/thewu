import { bind } from "@thewu/browser";
import * as Wu from "@thewu/core";
import { Component, Default, Prop, State } from "@thewu/core";

@Component()
class Counter {
  @State
  @Default({ prop: "initCount" })
  count!: number;

  @State
  profile: any = {};

  constructor() {
    console.info("bar construct");
  }

  async onMounted() {
    // console.info("Bar on mounted");
    // const response = await fetch("https://api.github.com/users/mistricky");
    // const data = await response.json();
    //
    this.profile = {
      login: "mistricky",
      avatar_url: "https://avatars.githubusercontent.com/u/22574136?v=4",
    };
  }

  render() {
    console.info("bar rendering");

    return (
      <div>
        <div>{this.profile.login}</div>
        <img src={this.profile.avatar_url} />
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

  constructor() {
    console.info("foo construct");
  }

  onMounted() {
    console.info("Foo mounted");
  }

  render(): Wu.WuNode {
    console.info("foo rendering");

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

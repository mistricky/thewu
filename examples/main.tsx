import * as Wu from "@wu/core";
import { Component, Prop, State, bind } from "@wu/browser";

@Component()
class Foo implements Component {
  @State()
  name = "foo";

  @Prop("age")
  age!: number;

  say() {
    console.info(`My name is ${this.name}, and I'm ${this.age} years old.`);
  }

  render(): Wu.WuNode {
    return <div>Hello World</div>;
  }
}

// const Foo = ({ bar }: { bar: number }) => {
//   return <input value={bar} />;
// };

// const element = (
//   <a>
//     Hello<div>World</div>
//     <Foo bar={1}></Foo>
//     <button style={{ color: "red" }} onClick={() => alert("click")}>
//       Click
//     </button>
//   </a>
// );

bind(document.querySelector("#container")!).create({
  state: { count: 0, value: "" },
  reducer: {
    add: (state) => ({ ...state, count: state.count + 1 }),
    updateValue: (state, payload) => ({ ...state, value: payload }),
  },
  view: (state, emit) => (
    <div>
      {state.count}
      <button onClick={() => emit("add")}>+1</button>
      {!!state.count ? <p>Hello</p> : <div>No</div>}
      <br />
      <input
        value={state.value}
        onInput={(e: any) => emit("updateValue", e.target.value)}
      />
      {state.value}
    </div>
  ),
});

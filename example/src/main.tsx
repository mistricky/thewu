import Flat, { FlatComponent, Prop, _Element, Ele, Children } from "../../dist";

class Greeter extends FlatComponent {
  @Children()
  names!: string[];

  render(): JSX.Element {
    let greeters = names.map(name => <p>hello {name}</p>);

    return <div>{greeters}</div>;
  }
}

let names = ["A", "B", "C"];
let input = (
  <div id="foo">
    <Greeter>{names}</Greeter>
  </div>
);

new Ele(input).bindDOM(document.querySelector("#root"));

import { Ele } from "./core/element";
import { compile } from "./core/html-compiler";
let { ele } = Ele;

// let ul = new Ele("ul", { id: "list" }, [
//   ele("li", { class: "item" }, ["Item1"]),
//   ele("li", { class: "item" }, ["Item2"]),
//   ele("li", { class: "item" }, ["Item3"])
// ]);

let name = "hello world";

let input = compile`<ul>
  <li>item1</li>
  <li>item2</li>
  <li>item3</li>
</ul>`;

console.info(input);

let ul = new Ele(input);

ul.render().bindDOM(document.querySelector("#root"));

import { Ele } from "./core/element";
import { compile } from "./core/html-compiler";

// let ul = new Ele("ul", { id: "list" }, [
//   ele("li", { class: "item" }, ["Item1"]),
//   ele("li", { class: "item" }, ["Item2"]),
//   ele("li", { class: "item" }, ["Item3"])
// ]);

let name = "hello world";

let items = new Array(3).fill(0).map((item, index) => `<li>${index++}</li>`);

let input = compile`
  <div>
    <ul>
      <li>${name}</li>
    </ul>
    ${name}
  </div>
`;

console.info(input);

new Ele(input).bindDOM(document.querySelector("#root"));

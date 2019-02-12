import { Ele } from "./core/element";
import { compile } from "./core/html-compiler";

// let ul = new Ele("ul", { id: "list" }, [
//   ele("li", { class: "item" }, ["Item1"]),
//   ele("li", { class: "item" }, ["Item2"]),
//   ele("li", { class: "item" }, ["Item3"])
// ]);

let name = "hello world";

let input = compile`<div></div>`;

let ul = new Ele(input).bindDOM(document.querySelector("#root"));

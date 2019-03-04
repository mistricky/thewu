import Flat, { _Element, FlatElement } from "../../dist";
import { ipt } from "../../dist/utils";
import { App } from "./views/app";

const input = (
  <div>
    <App />
  </div>
);

ipt(input);

new FlatElement(input).bindDOM(document.querySelector("#root"));

import Flat, { _Element, FlatElement, FlatComponent, State } from "../../dist";
import { App } from "./views/app";

new FlatElement(<App />).bindDOM(document.querySelector("#root"));

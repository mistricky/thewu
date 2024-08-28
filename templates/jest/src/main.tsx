import "./main.css";
import { bind } from "@thewu/browser";
import { Component, LifeCycle, State } from "@thewu/core";
import WuLogo from "../public/logo.svg";

interface RepositoryContentResponse {
  content: string;
}

interface PackageJSON {
  version: string;
}

@Component()
class App {
  @State
  version?: string = undefined;

  get formttedVersion() {
    return this.version ? `v${this.version}` : "...";
  }

  render() {
    return (
      <div class="container">
        <div class="main">
          <img class="logo" src={WuLogo} />
          <h1 class="title">The Wu front-end framework</h1>
          <div class="version">{this.formttedVersion}</div>
        </div>
        <div>
          <span class="info-template">Jest template</span>
        </div>
      </div>
    );
  }

  @LifeCycle.onMounted
  async mounted() {
    const res = await fetch(
      "https://api.github.com/repos/mistricky/thewu/contents/package.json?ref=main",
    );
    const { content }: RepositoryContentResponse = await res.json();
    const { version }: PackageJSON = JSON.parse(atob(content));

    this.version = version;
  }
}

bind(<App></App>, document.querySelector("#container")!);

import "./main.css"
import { bind } from "@thewu/browser"
import { Component, LifeCycle, State } from "@thewu/core"
import WuLogo from "../public/logo.svg"

interface RepositoryContentResponse {
  content: string
}

interface PackageJSON {
  version: string
}

@Component()
class App {
  @State
  version?: string = undefined

  get formttedVersion() {
    return this.version ? `v${this.version}` : "..."
  }

  render() {
    return (
      <div class="p-5 font-rubik w-full h-full bg-dark flex justify-center items-center flex-col box-border">
        <div class="flex items-center">
          <img class="size-10" src={WuLogo} />
          <h1 class="font-bold text-white">The Wu front-end framework</h1>
          <div class="px-2.5 py-1.5 bg-shallow-dark ml-2.5 text-gray-white rounded-md">
            {this.formttedVersion}
          </div>
        </div>
        <div>
          <span class="text-white opacity-20">TailwindCSS template</span>
        </div>
      </div>
    )
  }

  @LifeCycle.onMounted
  async mounted() {
    const res = await fetch(
      "https://api.github.com/repos/mistricky/thewu/contents/package.json?ref=main"
    )
    const { content }: RepositoryContentResponse = await res.json()
    const { version }: PackageJSON = JSON.parse(atob(content))

    this.version = version
  }
}

bind(<App></App>, document.querySelector("#container")!)

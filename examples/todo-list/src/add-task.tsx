import { Component, Prop, State } from "@thewu/core";
import * as Wu from "@thewu/core";
import type { Task } from "./task";

@Component()
export class AddTask {
  @Prop()
  onTaskAdd!: (task: Task) => void;

  @State
  content = "";

  handleAddTaskButtonClick() {
    if (this.content === "") {
      alert("Please type something");
      return;
    }

    this.onTaskAdd({ name: this.content, isDone: false });
    this.content = "";
  }

  render() {
    return (
      <div class="flex">
        <input
          value={this.content}
          onInput={(e) => (this.content = e.target.value)}
          type="text"
          placeholder="Type here"
          class="input input-bordered input-md w-full max-w-xs mr-2"
        />
        <button
          onClick={() => this.handleAddTaskButtonClick()}
          class="btn btn-primary text-white"
        >
          Add
        </button>
      </div>
    );
  }
}

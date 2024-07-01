import { Component, Prop, State } from "@thewu/core";
import * as Wu from "@thewu/core";

export interface Task {
  name: string;
  isDone: boolean;
}

@Component()
export class TaskItem {
  @Prop()
  task: Task;

  @Prop()
  onClick!: (name: string) => void;

  render() {
    return (
      <div
        class={`card bg-base-100 w-96 shadow-xl mb-4 p-2 px-4 bg-white cursor-pointer ${this.task.isDone && "line-through"}`}
        onClick={this.onClick}
      >
        {this.task.name}
      </div>
    );
  }
}

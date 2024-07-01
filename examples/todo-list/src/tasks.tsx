import { Component, State, Prop } from "@thewu/core";
import * as Wu from "@thewu/core";
import { Task, TaskItem } from "./task";

@Component()
export class Tasks {
  @Prop()
  tasks: Task[];

  render() {
    return (
      <div class="mb-8">
        {this.tasks.map((task) => (
          <TaskItem task={task}></TaskItem>
        ))}
      </div>
    );
  }
}

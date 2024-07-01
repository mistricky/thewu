import * as Wu from "@thewu/core";
import { Component, State } from "@thewu/core";
import { AddTask } from "./add-task";
import { Task, TaskItem } from "./task";

@Component()
export class App {
  @State
  tasks: Task[] = [];

  finishTask(name: string) {
    this.tasks = this.tasks.map((task) => ({
      ...task,
      isDone: task.name === name,
    }));
  }

  render() {
    return (
      <div class="prose w-[384px] mx-[auto] mt-8">
        <div class="flex justify-between items-start w-full">
          <h1>The Wu Tasks</h1>
          <button class="mt-2 text-primary">Clear all</button>
        </div>
        <div class="mb-8">
          {this.tasks.map((targetTask) => (
            <TaskItem
              onClick={() => this.finishTask(targetTask.name)}
              task={targetTask}
            />
          ))}
        </div>
        <AddTask
          onTaskAdd={(task) => {
            this.tasks = this.tasks.concat(task);
          }}
        />
      </div>
    );
  }
}

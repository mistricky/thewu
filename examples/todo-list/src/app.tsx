import * as Wu from "@thewu/core";
import { Component, State } from "@thewu/core";
import { AddTask } from "./add-task";
import { Task, TaskItem } from "./task";

@Component()
export class App {
  @State
  tasks: Task[] = [];

  toggleTaskDoneState(targetIndex: number) {
    this.tasks = this.tasks.map((task, index) => ({
      ...task,
      isDone: targetIndex === index ? !task.isDone : task.isDone,
    }));
  }

  render() {
    return (
      <div class="prose w-[384px] mx-[auto] mt-8">
        <div class="flex justify-between items-start w-full">
          <h1>The Wu Tasks</h1>
          <button class="mt-2 text-primary" onClick={() => (this.tasks = [])}>
            Clear all
          </button>
        </div>
        <div class="mb-8">
          {this.tasks.length ? (
            this.tasks.map((targetTask, index) => (
              <TaskItem
                onClick={() => this.toggleTaskDoneState(index)}
                task={targetTask}
              />
            ))
          ) : (
            <div>No tasks found</div>
          )}
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

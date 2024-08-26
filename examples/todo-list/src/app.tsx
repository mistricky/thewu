import { Component, State, LifeCycle } from "@thewu/core";
import { AddTask } from "./add-task";
import { Task, TaskItem } from "./task";

@Component()
export class Placeholder {
  @LifeCycle.onDestroy
  destroy() {
    console.info("Placeholder destroying...");
  }

  render() {
    return <div>No task found</div>;
  }
}

@Component()
export class App {
  @State
  tasks: Task[] = [];

  toggleTaskDoneState(targetIndex: number) {
    const targetTask = this.tasks[targetIndex];

    targetTask.isDone = !targetTask.isDone;
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
            <Placeholder></Placeholder>
          )}
        </div>
        <AddTask
          onTaskAdd={(task) => {
            this.tasks.push(task);
          }}
        />
      </div>
    );
  }
}

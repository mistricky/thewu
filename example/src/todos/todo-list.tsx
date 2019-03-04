import Flat from "../../../dist/core/h";
import { FlatComponent } from "../../../dist";
import { TodoTab } from "./todo-tab";
import { ControlBar } from "./control-bar";
import { TodoItemData, TodoItem } from "./todo-item";

export class TodoList extends FlatComponent {
  todos: TodoItemData[] = [
    { name: "hello", done: false },
    { name: "world", done: true }
  ];

  render() {
    let list = this.todos.map(item => (
      <TodoItem name={item.name} done={item.done} />
    ));

    return (
      <div>
        <TodoTab />
        {list}
        <ControlBar />
      </div>
    );
  }
}

import Flat from '../../../dist/core/h';
import { FlatComponent, State } from '../../../dist';
import { TodoTab } from './todo-tab';
import { ControlBar } from './control-bar';
import { TodoItem } from './todo-item';
export interface TodoItemData {
  name: string;
  done: boolean;
}

export class TodoList extends FlatComponent {
  @State()
  todos: TodoItemData[] = [
    { name: 'hello', done: false },
    { name: 'world', done: true }
  ];

  handleDoneClick(name: string) {
    this.todos = this.todos.map(item => {
      if (item.name === name) {
        item.done = true;
      }

      return item;
    });
  }

  handleAddItemClick(inputText: string) {
    this.todos.push({ name: inputText, done: false });
    console.info(inputText);
    console.info(this.todos);
  }

  render() {
    console.info('list render');
    let list = this.todos.map(item => {
      return (
        <TodoItem
          handleDoneClick={(name: string) => this.handleDoneClick(name)}
          name={item.name}
          done={item.done}
        />
      );
    });

    return (
      <div>
        <TodoTab />
        {list}
        <ControlBar
          handleAddItemClick={(inputText: string) =>
            this.handleAddItemClick(inputText)
          }
        />
      </div>
    );
  }
}

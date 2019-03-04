import Flat, { FlatComponent } from "../../../dist";
import { TodoList } from "../todos/todo-list";

export class App extends FlatComponent {
  render() {
    return (
      <div>
        <TodoList />
      </div>
    );
  }
}

import Flat, { FlatComponent, Prop } from "../../../dist";

export interface TodoItemData {
  name: string;
  done: boolean;
}

export class TodoItem extends FlatComponent<TodoItemData> {
  @Prop()
  name!: string;

  @Prop()
  done!: boolean;

  render() {
    let text = this.done ? <del>{this.name}</del> : <span>{this.name}</span>;

    return (
      <div>
        {text}
        {this.done ? "" : <button>done</button>}
      </div>
    );
  }
}

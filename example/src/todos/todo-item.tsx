import Flat, { FlatComponent, Prop } from '../../../dist';

export interface TodoItemProps {
  name: string;
  done: boolean;
  handleDoneClick: (name: string) => void;
}

export class TodoItem extends FlatComponent<TodoItemProps> {
  @Prop()
  name!: string;

  @Prop()
  done!: boolean;

  @Prop()
  handleDoneClick!: (name: string) => void;

  render() {
    console.info('item render');
    let text = this.done ? <del>{this.name}</del> : <span>{this.name}</span>;

    return (
      <div>
        {text}
        {this.done ? (
          ''
        ) : (
          <button onclick={() => this.handleDoneClick(this.name)}>done</button>
        )}
      </div>
    );
  }
}

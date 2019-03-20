import { FlatComponent, State, Prop, ChangeEvent } from '../../../dist';
import Flat from '../../../dist/core/h';

interface ControlBarProps {
  handleAddItemClick: (inputText: string) => void;
}

export class ControlBar extends FlatComponent<ControlBarProps> {
  @State()
  inputText: string = '';

  @Prop()
  handleAddItemClick!: (inputText: string) => void;

  handleInputItemNameChange(text: string) {
    this.inputText = text;
  }

  render() {
    console.info('control bar render');

    return (
      <div>
        <div>
          <button onclick={() => this.handleAddItemClick(this.inputText)}>
            Add Item
          </button>
          <input
            onchange={(e: ChangeEvent<HTMLInputElement>) =>
              this.handleInputItemNameChange(e.target.value)
            }
            type="text"
            placeholder="Please input item name"
            value={this.inputText}
          />
        </div>
      </div>
    );
  }
}

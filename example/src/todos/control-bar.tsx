import { FlatComponent } from "../../../dist";
import Flat from "../../../dist/core/h";

export class ControlBar extends FlatComponent {
  render() {
    return (
      <div>
        <div>
          <button>Add Item</button>
          <input type="text" placeholder="Please input item name" />
        </div>
      </div>
    );
  }
}

import Flat, { _Element, FlatElement, FlatComponent, State } from '../../dist';

class Foo extends FlatComponent {
  @State()
  text: string = 'hello';

  handleInputChange(e: Flat.ChangeEvent<HTMLInputElement>) {
    this.text = e.target.value;
  }

  render() {
    return (
      <div>
        <input
          type="text"
          onchange={(e: Flat.ChangeEvent<HTMLInputElement>) =>
            this.handleInputChange(e)
          }
        />
        <p>{this.text}</p>
        <div>
          <div />
        </div>
      </div>
    );
  }
}

new FlatElement(<Foo />).bindDOM(document.querySelector('#root'));

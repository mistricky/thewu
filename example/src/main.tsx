import Flat, { FlatElement, State, Computed } from '../..';
import { Component } from '../../dist/core/component/index';
import { Bar } from './bar';

class Foo implements Component {
  @State()
  text = true;

  abc(e: any) {
    this.text = !this.text;

    console.info('should value', this.text);
  }

  @Computed()
  get dist() {
    console.info('trigger');
    return this.text ? 'woshi true' : 'woshi false';
  }

  render() {
    console.info('firstRender');

    return (
      <div>
        <p>%:this.text ? 'woshi true' : 'woshi false'%</p>
        <input type="text" oninput={(e: any) => this.abc(e)} />
        <p>{this.dist}</p>
        <p>{this.text}</p>
        <div>
          <div>
            asdads
            <p>asdasddsasda</p>
          </div>
        </div>
        {this.text}
        <Bar></Bar>
      </div>
    );
  }
}

new FlatElement((<Foo />)).bindDOM(document.querySelector('#root'));

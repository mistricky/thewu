import Flat from '../..';

export class Bar {
  render() {
    return (
      <div>
        bar
        <div>1{this.props.text}</div>
      </div>
    );
  }
}

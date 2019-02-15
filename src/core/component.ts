export class FlatComponent<Props = {}, State = {}, Mixin = {}> {
  protected isPropertyInit = false;
  protected _key: symbol;

  constructor() {
    this._key = Symbol("FlatComponent");
  }

  props!: Props;
  componentWillMount() {}
  componentDidMount() {}

  _sysDidMount() {
    this.isPropertyInit = true;
  }
}

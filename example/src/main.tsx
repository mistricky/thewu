import Flat, {
  FlatComponent,
  Prop,
  _Element,
  FlatElement,
  Children,
  State
} from "../../dist";

interface GreeterProps {
  children: string[];
  a: string;
}

interface PersonProps {
  name: string;
  age: number;
}

class Person extends FlatComponent<PersonProps> {
  @Prop()
  name!: string;

  @Prop()
  age!: number;

  render() {
    console.info("person render");
    console.info(this.name, this.age);

    return (
      <div>
        <p>name: {this.name}</p>
        <p>age: {this.age}</p>
      </div>
    );
  }
}

class Greeter extends FlatComponent<GreeterProps> {
  constructor() {
    super();
    // setTimeout(() => {
    //   this.age = 20;
    // }, 1000);
  }

  @Children()
  names!: string[];

  @State()
  age = 19;

  @Prop()
  a!: string;

  componentWillMount() {
    console.info("will mount");
  }

  componentDidMount() {
    console.info("did mount");
  }

  render(): JSX.Element {
    let greeters = names.map(name => <p>hello {name}</p>);
    console.info("greeter render");
    console.info(this.a);

    return (
      <div>
        <p>{greeters}</p>
        <Person name="zhangsan" age={10} />
      </div>
    );
  }
}

function hello() {
  console.info(hello);
}

let names = ["A", "B", "C"];
let input = (
  <div id="foo" onclick={hello}>
    <Greeter a="aa">{names}</Greeter>
  </div>
);

new FlatElement(Object.assign({}, input)).bindDOM(
  document.querySelector("#root")
);

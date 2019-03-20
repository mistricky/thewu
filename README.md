<div>
  <p align="center"><img src="https://github.com/flat-dev-ti/Flat/blob/master/doc/logo.png" alt="fre logo" width="180"></p>
  <h1 align="center" style="font-size:100px;">Flat</h1>
</div>
<p align="center">A lightweight MVVM framework base on TypeScript.</p>
<p align="center">
  <img src="https://img.shields.io/github/license/flat-dev-ti/Flat.svg?style=flat-square">
  <img src="https://img.shields.io/badge/TypeScript-3.2-blue.svg?style=flat-square">
</p>

# Flat

Flat is a lightweight MVVM framework base on TypeScript, and flat can provide more possibilities in your project.

## Render

在执行 render 的时候，会将所有的数组抽成扁平，flat 会认为，children 就只有 Text 节点和 \_Elememt 节点，相对来说，抽成扁平，在性能上也会得到提升。

为了能精确定位到更新的元素，在 Component 的原型上附加了类型为 symbol 的 \_key，用来唯一标识一个组件

不必关心节点的 key, flat 在初次解析的时候，附加了 component 的 key，key 用了 Symbol 类型，为了保证对比的是同一个 key，于是把 key 附在了组件上。

为直接定位更改的元素，flat 采用了`ES6`的 `Proxy/ Reflect`，因为已经知道了渲染的元素的位置，变更的组件的子组件并不会重新调用 render，大幅度提高了渲染的性能

## About Decorator

TypeScript 的 Decorator 不能支持改变类型，这样只有使用类 React 的继承 FlatComponent 来完成对类型的约束，使 Decorator 不能专注的完成一件事情，在用户看来，除了使用 Decorator 还要做额外的工作是在太麻烦了，于是将原来的 FlatComponent 装饰器推掉。

## State && Props

值得一提的是，`flat` 为避免重复 `渲染` 做了处理， 在 `flat` 里你不必担心不必要的 `渲染`。

### State

`flat` 里的`state`是默认就是 `immutable` 的状态，在 `component` 中会维护一个对使用者透明的 `$state` 对象，它由 `Proxy` 来做支撑，当每次更改 `state` 的时候都会触发重新创建一个 `$state` 对象，在必要的时候，直接对比 `$state` 对象就能知道是否有 `state` 进行了变更，防止重复渲染，本来是想拿掉 `shouldComponentUpdate`这个钩子，但是考虑到一些特殊的场景会在 `render` 执行一些必要的逻辑，所以还是会有对`shouldComponentUpdate`有支持。

### Props

为了让 `props` 能够避免重复渲染，`flat`会在判断是否需要 `render`的时候做一次比较，比较元素上的 `Attributes`，但是只会进行第一层的比较，遇到复合数据类型，为了不为使用复合数据类型而牺牲渲染效率，`flat` 只会简单的比较它们的引用，如果不相同，则执行渲染 。

但是你大可以不必担心这类的问题，在 `React` 中提出了使用 `immutable` 来创建一个新的对象，来防止重复渲染，方便比较，但是相反，在 `falt` 中，你只需要直接更改它即可，其他繁琐的事情都由 `falt` 帮你做了。

```tsx
class App extends FlatComponent {
  @State()
  person = {
    name: 'zhangsan',
    age: 20
  };

  changeAge() {
    this.person.age++;
  }

  render() {
    console.info('app render');

    return (
      <div id="foo">
        <Greeter person={this.person} />
        <button onclick={() => this.changeAge()}>change age</button>
      </div>
    );
  }
}
```

每当执行到 `changeAge` 的时候，`falt` 会在背后帮你产生一个新对象，以减少重复渲染的问题。

## Children

至于 `children` 它作为一种特殊的 `props` 也会执行 `props` 的相关比较逻辑。

`flat` 里采用一个 `children` 的规范，如果你传入一个以上的 `children`，`flat` 只会取第一个 `children` 来注入。

**Right**

```jsx
<Foo>{this.bar}</Foo>
```

**Foo**

```jsx
<Foo>
  {this.name}
  {this.age} {/* age 不会被注入到 Foo */}
</Foo>
```

## String Template Compiler

对于 string template 变量的求值，默认认定为 Text 节点，在解析模版完成后，再进行值的插入。
这里有一个例外，当变量为数组时，会在解析模版之前就对其进行求值，然后再把值拼接到模版，flat 会认为，数组返回的也是一个迭代模版。

```typescript
import Flat, { FlatComponent, Prop, _Element, Ele, Children } from '../../dist';

class Greeter extends FlatComponent {
  @Children()
  names!: string[];

  render(): JSX.Element {
    let greeters = names.map(name => <p>hello {name}</p>);

    return <div>{greeters}</div>;
  }
}

let names = ['A', 'B', 'C'];
let input = (
  <div id="foo">
    <Greeter>{names}</Greeter>
  </div>
);

new Ele(input).bindDOM(document.querySelector('#root'));
```

## 关于 \_Key

`flat` 里的 `key` 跟 `react` 或者 `vue` 的 `key` 不同，`flat` 的 `key` 是用 `Symbol` 来表示的，于是比较的时候仅仅是比较的是引用，如果两个 `key` 相同，那么则认为它是完全相同的节点。
`_key` 被挂载到 `FlatComponent` 下，在创建组件的时候会被继承下来。

在 `flat` 中，所有以 `_` 或者是 `$` 开头的变量，都是不被暴露出的，因此，你不能在 `flat` 中被访问到。

## Two-Way Data-Binding

这里给出一个 `flat` 实现双向数据绑定的例子

```tsx
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
      </div>
    );
  }
}

new FlatElement(<Foo />).bindDOM(document.querySelector('#root'));
```

![two-way-data-binding](https://github.com/flat-dev-ti/Flat/blob/master/doc/flat-bind.gif)

## LICENSE

MIT

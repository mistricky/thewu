<div>
  <p align="center"><img src="https://github.com/flat-dev-ti/Flat/blob/master/doc/logo.png" alt="fre logo" width="180"></p>
  <h1 align="center" style="font-size:100px;">Flat</h1>
</div>
<p align="center">A lightweight MVVM framework base on TypeScript.</p>
<p align="center">
</p>

# Flat

A lightweight MVVM framework base on TypeScript.

dev...

## Render

在执行 render 的时候，会将所有的数组抽成扁平，flat 会认为，children 就只有 Text 节点和 \_Elememt 节点，相对来说，抽成扁平，在性能上也会得到提升。

## About Decorator

TypeScript 的 Decorator 不能支持改变类型，于是将原来的 FlatComponent 装饰器推掉，使用类 React 的继承 FlatComponent 来完成对类型的改变。

## String Template Compiler

对于 string template 变量的求值，默认认定为 Text 节点，在解析模版完成后，再进行值的插入。
这里有一个例外，当变量为数组时，会在解析模版之前就对其进行求值，然后再把值拼接到模版，flat 会认为，数组返回的也是一个迭代模版。

```typescript
import Flat, { FlatComponent, Prop, _Element, Ele, Children } from "../../dist";

class Greeter extends FlatComponent {
  @Children()
  names!: string[];

  render(): JSX.Element {
    let greeters = names.map(name => <p>hello {name}</p>);

    return <div>{greeters}</div>;
  }
}

let names = ["A", "B", "C"];
let input = (
  <div id="foo">
    <Greeter>{names}</Greeter>
  </div>
);

new Ele(input).bindDOM(document.querySelector("#root"));
```

TODO：

- [x] 对于自定义组件的求值策略
- [ ] 组件钩子的调用时机以及确定钩子函数
- [ ] ~~@FlatComponent 实现~~
- [x] Props 实现，以及 @Prop 的实现
- [ ] virtual DOM 的 Diff 算法

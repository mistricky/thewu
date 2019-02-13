# Flat

A lightweight MVVM framework base on hook.

dev...

## String Template Compiler

对于 string template 变量的求值，默认认定为 Text 节点，在解析模版完成后，再进行值的插入。
这里有一个例外，当变量为数组时，会在解析模版之前就对其进行求值，然后再把值拼接到模版，flat 会认为，数组返回的也是一个迭代模版。

```typescript
@FlatComponent()
export class Say {
  @Prop()
  children: string;

  render() {
    return compile`
      <p>${children}</p>
    `;
  }
}

@FlatComponent()
export class Greeter {
  @Prop()
  text: string;

  render() {
    return compile`
      <${Say}>${text}</>
    `;
  }
}
```

TODO：
- [ ] 对于自定义组件的求值策略
- [ ] 组件钩子的调用时机以及确定钩子函数
- [ ] @FlatComponent 实现
- [ ] Props 实现，以及 @Prop 的实现
- [ ] virtual DOM 的 Diff 算法

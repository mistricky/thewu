export function markProp(target: any, key: string, symbol: Symbol) {
  let originProps: string[] | undefined;
  let props: string[] = [];
  props.push(key);

  if ((originProps = Reflect.getMetadata(symbol, target))) {
    props = props.concat(originProps);
  }

  Reflect.defineMetadata(symbol, props, target);
}

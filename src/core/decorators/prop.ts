import "reflect-metadata";

export const PROP_KEY = Symbol("flat:prop");

export function Prop() {
  return function(target: any, key: string) {
    let originProps: string[] | undefined;
    let props: string[] = [];
    props.push(key);

    if ((originProps = Reflect.getMetadata(PROP_KEY, target))) {
      props = props.concat(originProps);
    }

    Reflect.defineMetadata(PROP_KEY, props, target);
  };
}

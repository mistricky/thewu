import "reflect-metadata";
import { defineMetadatas } from "../../utils";

export const METADATA_PROP_KEY = Symbol("METADATA_PROP_KEY");

// The Prop decorator map the prop value to the property of instance
export const Prop =
  (propName?: string) => (target: any, propertyKey: string) => {
    defineMetadatas(METADATA_PROP_KEY, target, {
      propertyKey,
      propName: propName ?? propertyKey,
    });
  };

export const setProp = (target: any, props: Record<string, unknown>) => {
  const propMetadatas = Reflect.getMetadata(METADATA_PROP_KEY, target) ?? [];

  for (const { propertyKey, propName } of propMetadatas) {
    target[propertyKey] = props[propName];
  }
};

export const METADATA_PROPS_KEY = Symbol("METADATA_PROP_KEY");

export const Props = (target: any, propertyKey: string) => {
  defineMetadatas(METADATA_PROPS_KEY, target, propertyKey);
};

export const setProps = (target: any, props: Record<string, unknown>) => {
  const propsKeys = Reflect.getMetadata(METADATA_PROPS_KEY, target) ?? [];

  for (const propertyKey of propsKeys) {
    target[propertyKey] = { ...props };
  }
};

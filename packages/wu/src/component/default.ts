import { defineMetadatas } from "../utils";

interface DefaultParams {
  prop?: string;
}

const DEFAULT_FROM_PROP_METADATA_KEY = Symbol("DEFAULT_FROM_PROP_METADATA_KEY");

export const Default =
  ({ prop }: DefaultParams) =>
  (target: any, propertyKey: string) => {
    defineMetadatas(DEFAULT_FROM_PROP_METADATA_KEY, target, {
      prop,
      propertyKey,
    });
  };

export const assignDefault = (target: any, props: Record<string, unknown>) => {
  const propDefaultMetadata =
    Reflect.getMetadata(DEFAULT_FROM_PROP_METADATA_KEY, target) ?? [];

  for (const { prop: propName, propertyKey } of propDefaultMetadata) {
    target[propertyKey] = props[propName];
  }
};

import "reflect-metadata";

export const METADATA_PROP_KEY = Symbol("METADATA_PROP_KEY");

// The Prop decorator map the prop value to the property of instance
export const Prop =
  (propName?: string) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      METADATA_PROP_KEY,
      propName ?? propertyKey,
      target,
      propertyKey,
    );
  };

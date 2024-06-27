import "reflect-metadata";

export const METADATA_STATE_KEY = Symbol("METADATA_STATE_KEY");
export const METADATA_STATE_VALUE = Symbol("METADATA_STATE_VALUE");

export const State = () => (target: any, propertyKey: string) => {
  Reflect.defineMetadata(
    METADATA_STATE_KEY,
    METADATA_STATE_VALUE,
    target,
    propertyKey,
  );
};

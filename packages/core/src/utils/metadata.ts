export const defineMetadatas = (key: Symbol, target: any, value: unknown) => {
  const metadata = Reflect.getMetadata(key, target) ?? [];

  Reflect.defineMetadata(key, metadata.concat(value), target);
};

export function typeOf(value: unknown): string {
  return Object.prototype.toString.call(value);
}

export const enum DataType {
  Object = '[object Object]',
  Array = '[object Array]',
  String = '[object String]',
  Number = '[object Number]',
  Boolean = '[object Boolean]',
  Error = '[object Error]',
  Function = '[object Function]'
}

function compare(target: unknown, dataType: DataType): boolean {
  return typeAssert(target) === dataType;
}

export function typeAssert(target: unknown): string {
  return Object.prototype.toString.call(target);
}

export const isObject = (target: unknown): target is object =>
  compare(target, DataType.Object);

export const isArray = <T>(target: unknown): target is T[] =>
  compare(target, DataType.Array);

export const isString = (target: unknown): target is string =>
  compare(target, DataType.String);

export const isNumber = (target: unknown): target is number =>
  compare(target, DataType.Number);

export const isBoolean = (target: unknown): target is boolean =>
  compare(target, DataType.Boolean);

export const isError = (target: unknown): target is Error =>
  compare(target, DataType.Error);

export const isFunction = (target: unknown): target is Function =>
  compare(target, DataType.Function);

export const isUndefined = (target: unknown): target is undefined =>
  target === undefined;

export const isNull = (target: unknown): target is null => target === null;

// assets
export function emptyAssert<T>(
  value: T,
  cb: (val: NonNullable<T>) => void
): void {
  if (!!value) {
    cb(value as NonNullable<T>);
  }
}

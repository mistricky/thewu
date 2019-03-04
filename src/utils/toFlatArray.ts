export function ToFlatArray<T>(arr: T[]): T[] {
  return ([] as T[]).concat(...arr);
}

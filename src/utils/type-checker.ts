export function typeOf(value: unknown): string {
  return Object.prototype.toString.call(value);
}

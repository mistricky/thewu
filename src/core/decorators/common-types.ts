export interface Constructor {
  new (...args: any[]): {};
  [index: string]: any;
}

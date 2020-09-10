import { IDirective } from '../directive';

export const COMPONENT_KEY = Symbol('flat:component');

export interface ComponentDecoratorOptions {
  directives: IDirective[];
}

export interface ComponentMetaData {
  options: ComponentDecoratorOptions;
  id: string;
}

export function Component(options?: Partial<ComponentDecoratorOptions>) {
  const parsedOptions = options ?? { directives: [] };

  return (target: any) => {
    Reflect.defineMetadata(
      COMPONENT_KEY,
      { options: parsedOptions, id: `${target.name}|${Date.now()}` },
      target
    );
  };
}

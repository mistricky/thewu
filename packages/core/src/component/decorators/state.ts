import "reflect-metadata";
import { createReactiveFactory } from "@thewu/wux";
import { defineMetadatas, isObject } from "../../utils";

export const METADATA_STATE_KEY = Symbol("METADATA_STATE_KEY");
export const METADATA_STATE_VALUE = Symbol("METADATA_STATE_VALUE");

export const State = (target: any, propertyKey: string): any => {
  const reactive = createReactiveFactory();
  const reactiveProperty = reactive(
    { value: target[propertyKey] },
    { recursion: true },
  );

  defineMetadatas(METADATA_STATE_KEY, target, propertyKey);

  return {
    get: () => reactiveProperty.value,
    set: (value: unknown) => {
      if (isObject(value) || Array.isArray(value)) {
        reactiveProperty.value = reactive(value, {
          recursion: true,
          triggerStateName: "value",
        });

        return true;
      }

      reactiveProperty.value = value;
    },
  };
};

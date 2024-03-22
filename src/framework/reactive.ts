import { Effect } from "./effect";

/** Reactive object */
export type Reactive<T> = T;

/** Reactive object */
export const reactive = <T extends Record<string, any>>(object: T): Reactive<T> => {
  return new Proxy(object, {
    get(target, key: string) {
      Effect.track(target, key);
      return target[key as keyof T];
    },
    set(target, key: string, newValue) {
      target[key as keyof T] = newValue;
      Effect.trigger(target, key);
      return true;
    },
  });
};

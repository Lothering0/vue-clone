import { Effect } from "./effect";

/** Reactive variable. Getting/mutating its value should be processed via `value` key */
export interface Ref<T> {
  value: T;
}

/** Reactive variable. Getting/mutating its value should be processed via `value` key */
export const ref = <T>(value: T): Ref<T> => {
  const item = {
    get value() {
      Effect.track(item, "value");
      return value;
    },
    set value(newValue) {
      value = newValue;
      Effect.trigger(item, "value");
    },
  };

  return item;
};

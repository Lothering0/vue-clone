import { Effect, type EffectParams } from "./effect";

/** Variable which value computing automatically and recalculates every time when one of its dependencies has changed */
export interface WritableComputed<T> {
  value: T;
}

/** Variable which value computing automatically and recalculates every time when one of its dependencies has changed */
export interface Computed<T> extends WritableComputed<T> {
  readonly value: T;
}

export type ComputedGetter<T> = () => T;
export type ComputedSetter<T> = (newValue: T) => void;

export interface WritableComputedAccessors<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

export type ComputedAccessor<T> = Omit<WritableComputedAccessors<T>, "set">;

/** Variable which value computing automatically and recalculates every time when one of its dependencies has changed */
export function computed<T>(accessor: ComputedAccessor<T>): Computed<T>;
export function computed<T>(accessors: WritableComputedAccessors<T>): WritableComputed<T>;
export function computed<T>(callback: ComputedGetter<T>): Computed<T>;
export function computed<T>(
  callbackOrAccessors: ComputedGetter<T> | ComputedAccessor<T> | WritableComputedAccessors<T>
): Computed<T> | WritableComputed<T> {
  const isArgumentFunction = typeof callbackOrAccessors === "function";
  const get = isArgumentFunction ? callbackOrAccessors : callbackOrAccessors.get;
  const set = "set" in callbackOrAccessors ? callbackOrAccessors.set : undefined;

  const params: EffectParams<T> = { get, set, immediate: true };

  return new Effect(params);
}

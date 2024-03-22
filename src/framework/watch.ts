import { Computed } from "./computed";
import { Effect } from "./effect";
import { Ref } from "./ref";

type WatchDependencies = Ref<any> | Computed<any> | (Ref<any> | Computed<any>)[];
type WatchCallback = () => void;

export interface WatchOptions {
  /** Invokes a watcher callback immediately */
  immediate: boolean;
}

/** A watcher will invoke its callback every time when one of the provided dependencies has changed */
export const watch = (dependencies: WatchDependencies, callback: WatchCallback, options?: WatchOptions) => {
  const deps = Array.isArray(dependencies) ? dependencies : [dependencies];

  /** Effect without tracking dependencies */
  const effect = new Effect({
    get: callback,
    immediate: options?.immediate ?? false,
    shouldTrack: false,
  });

  // Tracking dependencies from `dependencies` param
  deps.forEach((dependency) => {
    Object.keys(dependency).forEach((key) => {
      effect.track(dependency, key);
    });
  });
};

/**
 * Watcher which invokes its callback immediately and automatically collect dependencies.
 * A watchEffect will invoke its callback every time when one of the collected dependencies has changed
 */
export const watchEffect = (callback: WatchCallback) => {
  new Effect({
    get: callback,
    immediate: true,
  });
};

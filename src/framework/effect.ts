export type Dependency = Record<DependencyKey, any>;
export type DependencyKey = string;

/**
 * Collection of all effects subscribed to dependency and its keys.
 * WeakMap: Dependency -> Map: dependency key -> Set: dependent effects
 */
export type EffectsMap = WeakMap<Dependency, Map<DependencyKey, Set<Effect<any>>>>;
/** Collection of all effect dependencies */
export type EffectDependencies = WeakMap<Dependency, Set<DependencyKey>>;

export type EffectGetter<T> = () => T;
export type EffectSetter<T> = (newValue: T) => void;

export interface EffectAccessors<T> {
  get: EffectGetter<T>;
  set?: EffectSetter<T>;
}

export interface EffectOptions {
  /** Should effect getter be invoked immediately */
  immediate: boolean;
  /** Should effect track dependencies. While it is set to `false` no one dependency will be tracked */
  shouldTrack?: boolean;
}

export interface EffectParams<T> extends EffectAccessors<T>, EffectOptions {}

/**
 * Reactive side-effect. Runs its getter every time when one of its dependencies has changed.
 * While it is active and `shouldTrack` is set to `true`, all used dependencies will be tracked by this effect
 */
export class Effect<T> {
  /** Array of current active effects. All dependencies will be collected to last element of array */
  static activeOnes: Effect<any>[] = [];

  /**
   * Collection of all effects subscribed to dependency and its keys.
   * WeakMap: Dependency -> Map: dependency key -> Set: dependent effects
   */
  static effects: EffectsMap = new WeakMap();

  /** Current active effect. All dependencies will be collected to it */
  static get active(): Effect<any> | null {
    const lastIndex = Effect.activeOnes.length - 1;
    return Effect.activeOnes[lastIndex] ?? null;
  }

  /** Collection of all effect dependencies */
  dependencies: EffectDependencies = new WeakMap();

  /** Should effect track dependencies. While it is set to `false` no one dependency will be tracked */
  private shouldTrack: boolean;

  private get: EffectGetter<T>;
  private set?: EffectSetter<T>;

  constructor(params: EffectParams<T>) {
    Effect.activeOnes.push(this);
    this.shouldTrack = params.shouldTrack ?? true;
    this.get = params.get;
    this.set = params.set;
    if (params.immediate) params.get();
    Effect.activeOnes.pop();
  }

  get value() {
    Effect.track(this, "value");
    return this.get();
  }

  set value(newValue: T) {
    this.set?.(newValue);
    Effect.trigger(this, "value");
  }

  /** Subscribe to dependency and its key */
  track(dependency: Dependency, dependencyKey: DependencyKey) {
    this.subscribe(dependency, dependencyKey);
    this.registerAsSubscriber(dependency, dependencyKey);
  }

  /** Subscribe current instance to dependency */
  private subscribe(dependency: Dependency, dependencyKey: DependencyKey) {
    if (!this.dependencies.has(dependency)) this.dependencies.set(dependency, new Set());
    this.dependencies.get(dependency)!.add(dependencyKey);
  }

  /** Register current instance as subscriber to dependency */
  private registerAsSubscriber(dependency: Dependency, dependencyKey: DependencyKey) {
    if (!Effect.effects.has(dependency)) Effect.effects.set(dependency, new Map());
    const effectMap = Effect.effects.get(dependency)!;

    if (!effectMap.has(dependencyKey)) effectMap?.set(dependencyKey, new Set());
    effectMap.get(dependencyKey)!.add(this);
  }

  /** Track dependency to current active effect instance if it should track dependencies */
  static track(dependency: Dependency, dependencyKey: DependencyKey) {
    if (!this.active?.shouldTrack) return;
    this.active.track(dependency, dependencyKey);
  }

  /** Trigger to rerun all subscribers to dependency */
  static trigger(dependency: Dependency, dependencyKey: DependencyKey) {
    this.effects
      .get(dependency)
      ?.get(dependencyKey)
      ?.forEach((effect) => {
        effect.get();
      });
  }
}

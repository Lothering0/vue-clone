import { Effect } from "./effect";

export type SetupFunction = () => HTMLElement;

type OnBeforeMount = () => void;
type OnMounted = () => void;
type OnBeforeUpdate = () => void;
type OnUpdated = () => void;

export class Component {
  /** Current active component. All hooks will be registered to it */
  static active: Component | null = null;
  isMounted = false;

  private effect?: Effect<HTMLElement>;

  onBeforeMount: OnBeforeMount | null = null;
  onMounted: OnMounted | null = null;
  onBeforeUpdate: OnBeforeUpdate | null = null;
  onUpdated: OnUpdated | null = null;

  constructor(public setup: SetupFunction) {}

  /** Mount component into element by provided selector */
  mount(selector: string) {
    Component.active = this;
    this.effect = new Effect({
      get: this.setup,
      immediate: false,
    });
    this.insert(selector);
    Component.active = null;
  }

  private insert(selector: string) {
    const $parent = this.getParent(selector);

    const value = this.effect?.value;
    this.onBeforeMount?.();

    if (value) $parent.appendChild(value);

    this.isMounted = true;
    this.onMounted?.();
  }

  /** Returns parent node for component by provided selector */
  private getParent(selector: string): Element {
    const $parent = document.querySelector(selector);
    if (!$parent) throw new Error(`There is not element by selector ${selector}`);
    return $parent;
  }

  /** Handles onBeforeUpdate hook */
  startBeforeUpdate() {
    if (this.isMounted) this.onBeforeUpdate?.();
  }

  /** Handles onUpdated hook */
  startOnUpdated() {
    if (this.isMounted) this.onUpdated?.();
  }
}

export const defineComponent = (setup: SetupFunction) => {
  return new Component(setup);
};

/** Hook will be called before component mounting */
export const onBeforeMount = (callback: OnBeforeMount) => {
  if (!Component.active) return;
  Component.active.onBeforeMount = callback;
};

/** Hook will be called after component has mounted */
export const onMounted = (callback: OnMounted) => {
  if (!Component.active) return;
  Component.active.onMounted = callback;
};

/** Hook will be called before component rerender */
export const onBeforeUpdate = (callback: OnBeforeUpdate) => {
  if (!Component.active) return;
  Component.active.onBeforeUpdate = callback;
};

/** Hook will be called after component has rerendered */
export const onUpdated = (callback: OnUpdated) => {
  if (!Component.active) return;
  Component.active.onUpdated = callback;
};

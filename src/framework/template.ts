import { Component } from "./component";
import { Effect } from "./effect";

/** Getter of inner text */
type TemplateGetter = () => string;
/** HTML-element(s) or getter of inner text */
type HContent = TemplateGetter | HTMLElement | HTMLElement[];

/** Attributes of HTML-element */
type HAttributes = Record<string, any>;

/** Returns `true` if value is an HTML-element attributes */
const isAttributes = (value: unknown): value is HAttributes => typeof value === "object" && !Array.isArray(value);

/** Set attributes to provided HTML-element */
const setAttributes = ($element: Element, attributes: HAttributes) => {
  Object.entries(attributes).forEach(([qualifiedName, value]) => {
    if (typeof value === "function") ($element as any)[qualifiedName] = value;
    else $element.setAttribute(qualifiedName, value);
  });
};

/** Appends childs to provided HTML-element */
const appendChilds = ($element: Element, childs: HTMLElement[]) => {
  childs.forEach(($child) => {
    $element.appendChild($child);
  });
};

/** Set inner text to provided HTML-element and creates effect which dependencies are reactive elements used in `getContent` */
const setContent = ($element: HTMLElement, getContent: TemplateGetter) => {
  const component = Component.active;

  new Effect({
    get() {
      component?.startBeforeUpdate();
      $element.innerText = getContent();
      component?.startOnUpdated();
    },
    immediate: true,
  });
};

const createElement = (
  tag: keyof HTMLElementTagNameMap,
  attributes: HAttributes,
  content: TemplateGetter | HTMLElement[]
): HTMLElement => {
  const $element = document.createElement(tag);

  setAttributes($element, attributes);

  if (Array.isArray(content)) {
    // If `content` is an array of HTML-elements, then appending them to `$element`
    const childs = content;
    appendChilds($element, childs);
  } else {
    // Else if `content` is a template getter, then setting its value as inner text of `$element`
    const getContent = content;
    setContent($element, getContent);
  }

  return $element;
};

/** Explicitly returns a template getter or array of HTML-elements */
const getHContent = (content?: HContent): TemplateGetter | HTMLElement[] => {
  if (typeof content === "function") return content;
  if (content instanceof Node) return [content];
  if (Array.isArray(content)) return content;
  return [];
};

/** Utility for creating reactive HTML-elements */
export function h(tag: keyof HTMLElementTagNameMap, content?: HContent): HTMLElement;
export function h(tag: keyof HTMLElementTagNameMap, attributes?: HAttributes, content?: HContent): HTMLElement;
export function h(
  tag: keyof HTMLElementTagNameMap,
  attributesOrContent?: HAttributes | HContent,
  content?: HContent
): HTMLElement {
  /** Explicit attributes */
  const attrs = isAttributes(attributesOrContent) ? attributesOrContent : {};
  /** Explicit child elements or template getter */
  const innerContent = !isAttributes(attributesOrContent) ? attributesOrContent : content;
  let hContent: TemplateGetter | HTMLElement[] = getHContent(innerContent);

  return createElement(tag, attrs, hContent);
}

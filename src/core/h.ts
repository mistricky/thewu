import { isFunction } from '../utils';
import {
  TagName,
  Attrs,
  JSXElement,
  Children,
  ParsedJSXElement,
  FlatComponentConstructor
} from './render';
import { Render } from './render';
import { extract } from '@wizardoc/injector';

type ChildrenType<T> = T extends (infer U)[] ? U : T;

export type HyperScript = (
  tagName: string,
  attrs: Attrs,
  children: Children<JSXElement>
) => ParsedJSXElement;

export default function Flat(
  tagName: TagName,
  attrs: Attrs,
  ...children: ChildrenType<Children<ParsedJSXElement>>[]
): ParsedJSXElement {
  if (isFunction(tagName)) {
    return extract(Render).renderComponent(
      tagName as FlatComponentConstructor,
      attrs,
      children
    );
  }

  return {
    tagName,
    attrs: attrs || {},
    children
  };
}

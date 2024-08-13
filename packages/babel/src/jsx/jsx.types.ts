import type * as t from '@babel/types';
import type { SheetEntry } from '@native-twin/css';

export type JSXChildElement = t.JSXElement['children'][number];
export type AnyPrimitive = string | number | boolean;

export type MapChildFn = (child: t.JSXElement) => t.JSXElement;
export type MapAttributeFn = (attribute: t.JSXAttribute) => t.JSXAttribute;

export interface JSXMappedAttribute {
  prop: string;
  value: t.StringLiteral | t.TemplateLiteral;
  target: string;
}

export interface StyledPropEntries {
  entries: SheetEntry[];
  prop: string;
  target: string;
  expression: string | null;
  classNames: string;
}

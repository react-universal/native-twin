import { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { SheetEntry } from '@native-twin/css';
import { Tree } from '../utils/Tree';

export type JSXChildElement = t.JSXElement['children'][number];
export type AnyPrimitive = string | number | boolean;

export type MapChildFn = (child: t.JSXElement) => t.JSXElement;

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

export interface JSXFileTree {
  filePath: string;
  // parents: JSXElementTree[];
  parents: Tree<JSXElementTree>[];
}

export interface JSXElementTree {
  path: NodePath<t.JSXElement>;
  /** @deprecated DONT USE THIS ONE */
  childs: JSXElementTree[];
}

export interface JSXElementTreeMinimal {
  path: t.JSXElement;
  childs: JSXElementTreeMinimal[];
}

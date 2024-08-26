import { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { SheetEntry } from '@native-twin/css';
import { ChildsSheet, RuntimeComponentEntry } from '@native-twin/css/jsx';
import type { Tree } from '@native-twin/helpers/tree';
import { BabelJSXElementNode } from '../jsx-babel';

export type JSXChildElement = t.JSXElement['children'][number];
export type AnyPrimitive = string | number | boolean;

export type JSXElementNodePath = NodePath<t.JSXElement>;

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
  parents: Tree<JSXElementTree>[];
}

export interface JSXElementTree {
  path: JSXElementNodePath;
  order: number;
  uid: string;
  // childsCount: number;
}

export interface CompiledTree {
  node: BabelJSXElementNode;
  entries: RuntimeComponentEntry[];
  childEntries: ChildsSheet;
  parentSize: number;
  inheritedEntries: ChildsSheet | null;
  order: number;
  uid: string;
}

export interface JSXElementTreeMinimal {
  path: t.JSXElement;
  childs: JSXElementTreeMinimal[];
}

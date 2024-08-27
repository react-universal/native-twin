import { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { SheetEntry } from '@native-twin/css';
import { ChildsSheet, RuntimeComponentEntry } from '@native-twin/css/jsx';
import type { Tree } from '@native-twin/helpers/tree';
import { BabelJSXElementNode } from '../jsx-babel';

export type JSXChildElement = t.JSXElement['children'][number];

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
  parentID: string | null;
  source: {
    kind: string;
    source: string;
  };
}

export interface CompiledTree extends JSXElementTree {
  parentSize: number;
  compiled: {
    node: BabelJSXElementNode;
    entries: RuntimeComponentEntry[];
    childEntries: ChildsSheet;
  };
}

export interface JSXElementTreeMinimal {
  path: t.JSXElement;
  childs: JSXElementTreeMinimal[];
}

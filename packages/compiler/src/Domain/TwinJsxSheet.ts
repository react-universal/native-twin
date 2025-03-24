import type { TreeNode } from '@native-twin/helpers/tree';
import type { TwinStyledProp } from './JSXStyledProp';
import type { TwinJSXElement } from './TwinJSXElement';
import type { TwinJSXElementNode } from './TwinJSXElementNode';

export class TwinJsxStyleSheet {
  get id() {
    return this.jsxElement.id;
  }
  constructor(
    readonly jsxElement: TwinJSXElement,
    readonly nodes: TwinJsxNodeSheet[],
  ) {}
}

export class TwinJsxNodeSheet {
  constructor(
    readonly treeNode: TreeNode<TwinJSXElementNode>,
    readonly styledProps: TwinStyledProp[],
  ) {}
}

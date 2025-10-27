import type { TreeNode } from '@native-twin/helpers/tree';
import type { TwinJSXElement, TwinJSXElementNode } from '../Domain/TwinJSXElementNode';

export class TwinStyleTree {
  registry = new Map<string, SheetNode>();

  registerNode(node: TreeNode<TwinJSXElementNode>) {
    node.value;
    node.value.classNameProps.map((x) => x);
  }

  registerRootNode(jsxElement: TwinJSXElement) {
    return jsxElement;
  }
}

interface SheetNode {
  // jsxDeclarator: string;
  rootNode: string;
  parentNode: string | null;
  styledProps: {
    source: string;
    target: string;
    twinRules: string;
    text: string;
  }[];
}

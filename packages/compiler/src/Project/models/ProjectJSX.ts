import type * as Tree from '@native-twin/helpers/tree';
import type { TwinJSXElement, TwinJSXElementNode } from '../../Babel';
import type { ComponentStyledProp } from '../../StyleSheet';

export class CompiledTwinJSXElement {
  constructor(
    readonly twinElement: TwinJSXElement,
    readonly tree: Tree.Tree<CompiledTwinNodeElement>,
  ) {}
}

export class CompiledTwinNodeElement {
  constructor(
    readonly twinJsxNode: TwinJSXElementNode,
    readonly styledProps: ComponentStyledProp[],
  ) {}
}

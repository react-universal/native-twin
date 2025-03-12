import type { Tree } from '@native-twin/helpers/tree';
import type * as Option from 'effect/Option';
import type { TwinBabelModule } from '../Domain/TwinBabelModule';
import type { TwinJSXElement } from '../Domain/TwinJSXElement';
import type { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';
import type { CompilerStyleSheet, TwinJSXNodeStyledProp } from '../StyleSheet';

export class CompiledTwinJSXElement {
  constructor(
    readonly jsxElement: TwinJSXElement,
    readonly tree: Tree<CompiledTwinJSXElementNode>,
  ) {}
}

export class CompiledTwinJSXElementNode {
  constructor(
    readonly jsxElementNode: TwinJSXElementNode,
    readonly styledProps: TwinJSXNodeStyledProp[],
    readonly compiler: CompilerStyleSheet,
    readonly importSource: Option.Option<TwinJSXElement>,
  ) {}
}

export class CompiledTwinBabelModule {
  constructor(
    readonly module: TwinBabelModule,
    readonly jsxElements: CompiledTwinJSXElement[],
  ) {}
}

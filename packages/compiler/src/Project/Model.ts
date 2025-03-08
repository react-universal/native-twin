import type { Tree } from '@native-twin/helpers/tree';
import type * as Option from 'effect/Option';
import type {
  TwinBabelModule,
  TwinJSXElement,
  TwinJSXElementNode,
  TwinJSXNodeStyledProp,
} from '../Babel';

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
    readonly importSource: Option.Option<TwinJSXElement>,
  ) {}
}

export class CompiledTwinBabelModule {
  constructor(
    readonly module: TwinBabelModule,
    readonly jsxElements: Iterable<CompiledTwinJSXElement>,
  ) {}
}

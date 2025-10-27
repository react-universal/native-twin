import type { Tree } from '@native-twin/helpers/tree';
import * as HashMap from 'effect/HashMap';
import type { TwinModuleAst } from '../Domain/TwinAst';
import type { TwinJSXElement } from '../Domain/TwinJSXElementNode';
import type { TwinPath } from '../FileSystem';
import type { CompilerStyleSheet } from '../StyleSheet';
import type { TransformedJSXNode } from './Model';

export class TwinModuleBuilder {
  modules = new Map<TwinPath.FilePath, TwinModuleAst>();
  runtimeComponents: HashMap.HashMap<TwinJSXElement, Tree<TransformedJSXNode>> =
    HashMap.empty();
  constructor(readonly compiler: CompilerStyleSheet) {}

  registerJSXElement(_jsxElement: TwinJSXElement) {}
}

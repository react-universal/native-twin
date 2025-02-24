import { StyleSheetAdapter } from '@native-twin/core';
import type { SheetEntry } from '@native-twin/css';
import {
  type CompilerContext,
  type RuntimeSheetDeclaration,
  compileEntryDeclaration,
  mergeCompiledDeclarations,
} from '@native-twin/css/jsx';
import type * as Effect from 'effect/Effect';
import type { JSXMappedAttribute, TwinBabelModule } from '../Babel';
import type { InternalTwFn, InternalTwinConfig } from '../Config';
import type { TwinPath } from '../FileSystem';
import type { ComponentStyledProp, TwinJSXElementSheet } from './JSXStyleSheet';

export class CompilerStyleSheet extends StyleSheetAdapter<InternalTwinConfig> {
  constructor(
    readonly ctx: CompilerContext,
    readonly twinFn: InternalTwFn,
    debug: boolean,
  ) {
    super(debug);
  }

  toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[] {
    return entries
      .flatMap((x) => x.declarations)
      .map((x) => compileEntryDeclaration(x, this.ctx));
  }

  toNativeStyles(entries: SheetEntry[]) {
    const declarations = this.toRuntimeDecls(entries);
    return mergeCompiledDeclarations(declarations);
  }
}

export type SheetsRegistry = Map<TwinPath.FilePath, TwinJSXElementSheet[]>;
export type TwinTransformFn = (
  module: TwinBabelModule,
) => Effect.Effect<TwinJSXElementSheet[]>;
export type TwinExtractorFn = (props: JSXMappedAttribute[]) => ComponentStyledProp[];

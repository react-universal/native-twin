import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import type * as Effect from 'effect/Effect';
import type * as Option from 'effect/Option';
import {
  ComponentStyledProp,
  type JSXMappedAttribute,
  type TwinBabelModule,
  type TwinJSXElement,
  type TwinJSXElementNode,
} from '../Babel';
import type { TwinPath } from '../FileSystem';
import type { CompilerStyleSheet } from '../StyleSheet';

export type TwinRunnerPlatform = 'web' | 'native';

export class TwinProjectRunner {
  readonly sheet = new Map<TwinPath.FilePath, any>();
  private get ctx() {
    return this.twin.ctx;
  }
  private get twinFn() {
    return this.twin.twinFn;
  }
  constructor(private readonly twin: CompilerStyleSheet) {}

  domElementEntries(element: TwinJSXElementNode): ComponentStyledProp[] {
    return RA.map(
      element.styledProps,
      (prop) =>
        new ComponentStyledProp(
          prop,
          RA.map(this.twinFn(prop.value.text), (x) => new SheetEntryHandler(x, this.ctx)),
        ),
    );
  }
}

export class TwinJSXElementSheet {
  constructor(
    readonly jsxElement: TwinJSXElement,
    readonly sheets: Iterable<JSXElementNodeSheet>,
  ) {}
}

export class JSXElementNodeSheet {
  readonly childEntries: ComponentStyledProp['childEntries'];
  constructor(
    readonly styledProps: ComponentStyledProp[],
    readonly originalElement: Option.Option<TwinJSXElement>,
    readonly treeIDPaths: string[],
  ) {
    this.childEntries = styledProps.flatMap((x) => x.childEntries);
  }
}

export type TwinTransformFn = (
  module: TwinBabelModule,
) => Effect.Effect<TwinJSXElementSheet[]>;
export type TwinExtractorFn = (props: JSXMappedAttribute[]) => ComponentStyledProp[];
export type TransformedModule = [TwinPath.FilePath, TwinJSXElementSheet[]];

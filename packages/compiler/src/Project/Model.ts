import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import type { TwinJSXElementNode } from '../Babel';
import type { TwinPath } from '../FileSystem';
import { type CompilerStyleSheet, ComponentStyledProp } from '../StyleSheet';

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

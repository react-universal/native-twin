import type { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import type * as Option from 'effect/Option';
import type { JSXMappedAttribute, TwinJSXElement } from '../Babel';

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

export class ComponentStyledProp {
  readonly entries: SheetEntryHandler[];
  readonly childEntries: SheetEntryHandler[];
  constructor(
    readonly prop: JSXMappedAttribute,
    entries: SheetEntryHandler[],
  ) {
    [this.entries, this.childEntries] = RA.partition(entries, (x) => x.isChildEntry());
  }
}

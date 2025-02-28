import type { SheetEntryHandler } from '@native-twin/css/jsx';
import type * as Tree from '@native-twin/helpers//tree';
import * as RA from 'effect/Array';
import type {
  JSXMappedAttribute,
  TwinBabelModule,
  TwinJSXElement,
  TwinJSXElementNode,
} from '../Babel';
import type { TwinRunnerPlatform } from './Model';

export class ProjectStyleSheet {
  constructor(readonly modules: Iterable<BabelModuleSheet>) {}

  get modulesMap() {
    return new Map(
      RA.fromIterable(this.modules).map((module) => [
        module.module.file.path,
        RA.fromIterable(module.jsxElementSheets),
      ]),
    );
  }
}

export class BabelModuleSheet {
  constructor(
    readonly platform: TwinRunnerPlatform,
    readonly module: TwinBabelModule,
    readonly jsxElementSheets: TwinJSXElementSheet[],
  ) {}
}

export class TwinJSXElementSheet {
  constructor(
    readonly jsxElement: TwinJSXElement,
    readonly sheetsTree: Tree.Tree<JSXElementNodeSheet>,
  ) {}
}

export class JSXElementNodeSheet {
  readonly childEntries: ComponentStyledProp['childEntries'];
  constructor(
    readonly jsxElementNode: TwinJSXElementNode,
    readonly styledProps: ComponentStyledProp[],
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

import { SheetEntryHandler } from '@native-twin/css/jsx';
import type * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import { type BabelModule, ComponentStyledProp, type TwinDomElement } from '../Babel';
import type * as TwinPath from '../FileSystem/Path.model';
import type { CompilerStyleSheet } from '../models/CompilerSheet';

export class TwinProjectRunner {
  readonly sheet = new Map<TwinPath.FilePath, TwinModuleSheet>();
  private get ctx() {
    return this.twin.ctx;
  }
  private get twinFn() {
    return this.twin.twinFn;
  }
  constructor(private readonly twin: CompilerStyleSheet) {}

  domElementEntries(element: TwinDomElement): ComponentStyledProp[] {
    return pipe(
      element.styledProps,
      RA.map((prop) => {
        const entries = this.twinFn(prop.value.text);
        return new ComponentStyledProp(
          prop,
          RA.map(entries, (x) => new SheetEntryHandler(x, this.ctx)),
        );
      }),
    );
  }
}

export class TwinDomElementSheet {
  private readonly _compiledProps: ComponentStyledProp[];
  get compiledProps() {
    return this._compiledProps;
  }
  get domElementName() {
    return this._domElement.value.name;
  }
  constructor(
    private readonly _domElement: Tree.TreeNode<TwinDomElement>,
    runner: TwinProjectRunner,
  ) {
    this._compiledProps = runner.domElementEntries(_domElement.value);
  }
}

export class TwinModuleSheet {
  readonly _moduleSheet = new Map<string, Tree.Tree<TwinDomElementSheet>>();
  get sheetID() {
    return `${this.module.name}:${Hash.string(this.module.filepath)}`;
  }
  constructor(readonly module: BabelModule) {}

  registerDomTree(nodeName: string, tree: Tree.Tree<TwinDomElementSheet>) {
    this._moduleSheet.set(nodeName, tree);
  }
}

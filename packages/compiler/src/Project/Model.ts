import { SheetEntryHandler } from '@native-twin/css/jsx';
import type * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Hash from 'effect/Hash';
import type * as Option from 'effect/Option';
import {
  type BabelModule,
  ComponentStyledProp,
  type ModuleDependency,
  type TwinDomElement,
} from '../Babel';
import type { TwinPath } from '../FileSystem';
import type { CompilerStyleSheet } from '../StyleSheet';

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
    readonly originalDomElement: Option.Option<ModuleDependency>,
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

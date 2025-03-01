import { StyleSheetAdapter } from '@native-twin/core';
import type { SheetEntry } from '@native-twin/css';
import {
  type CompilerContext,
  type RuntimeSheetDeclaration,
  compileEntryDeclaration,
  mergeCompiledDeclarations,
} from '@native-twin/css/jsx';
import type { InternalTwFn, InternalTwinConfig, TwinRunnerPlatform } from '../Config';
import type { SheetEntryHandler } from '@native-twin/css/jsx';
import type * as Tree from '@native-twin/helpers//tree';
import * as RA from 'effect/Array';
import type {
  TwinJSXStyledProp,
  TwinBabelModule,
  TwinJSXElement,
  TwinJSXElementNode,
} from '../Babel';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as Data from 'effect/Data';
import * as Hash from 'effect/Hash';
import * as Ref from 'effect/Ref';
import * as Effect from 'effect/Effect';
import { traverseTreeEffect } from '../utils/tree.utils';

export class TwinJSXInjectInfo extends Data.Class<{
  sheetID: string;
  hasExpressions: boolean;
  isExternal: boolean;
  node: TwinJSXElementNode;
  isNative: boolean;
}> {}

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

  getProjectSheets() {
    return Stream.fromIterable(this.modules).pipe(
      Stream.mapEffect((moduleSheet) =>
        Effect.andThen(moduleSheet.getTwinSheet(), (data) => [moduleSheet, data]),
      ),
    );
  }
}

export class BabelModuleSheet {
  constructor(
    readonly platform: TwinRunnerPlatform,
    readonly module: TwinBabelModule,
    readonly jsxElementSheets: TwinJSXElementSheet[],
  ) {}

  get moduleID() {
    const fileID = Hash.string(this.module.file.path);

    return Hash.combine(fileID)(
      Hash.array(this.jsxElementSheets.map((x) => x.jsxElement.id)),
    );
  }

  getJSXNodeInfo(treeNode: Tree.TreeNode<JSXElementNodeSheet>): TwinJSXInjectInfo {
    const treePath = [...treeNode.getPath().map((x) => x.value.jsxElementNode.id)];
    const sheetID = treePath.join('->');
    const { jsxElementNode } = treeNode.value;
    return new TwinJSXInjectInfo({
      sheetID,
      node: jsxElementNode,
      hasExpressions: jsxElementNode.hasExpressions,
      isExternal: Option.isSome(jsxElementNode.dependency),
      isNative: Option.getOrElse(
        Option.map(jsxElementNode.dependency, (x) => x.fromReactNative),
        () => false,
      ),
    });
  }

  getTwinSheet() {
    return Effect.gen(this, function* () {
      const sheetRef = yield* Ref.make(new Map<string, TwinJSXInjectInfo>());
      const sheetID = `${Hash.string(this.module.file.path)}/${this.moduleID}`;
      yield* Stream.fromIterable(this.jsxElementSheets).pipe(
        Stream.mapEffect((jsxElement) =>
          traverseTreeEffect(jsxElement.sheetsTree, (treeNode) => {
            const info = this.getJSXNodeInfo(treeNode);
            return Ref.update(sheetRef, (x) =>
              x.set(treeNode.value.jsxElementNode.id, info),
            );
          }),
        ),
        Stream.runDrain,
      );
      return {
        sheetID,
        sheets: yield* sheetRef,
      };
    });
  }
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

export class ComponentStyledProp {
  readonly entries: SheetEntryHandler[];
  readonly childEntries: SheetEntryHandler[];
  constructor(
    readonly prop: TwinJSXStyledProp,
    entries: SheetEntryHandler[],
  ) {
    [this.entries, this.childEntries] = RA.partition(entries, (x) => x.isChildEntry());
  }

  get hasExpression() {
    return Option.isSome(this.prop.expression);
  }
}

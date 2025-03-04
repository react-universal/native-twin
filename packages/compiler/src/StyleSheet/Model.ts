import { StyleSheetAdapter } from '@native-twin/core';
import type { SheetEntry } from '@native-twin/css';
import {
  type CompilerContext,
  type RuntimeSheetDeclaration,
  compileEntryDeclaration,
  mergeCompiledDeclarations,
} from '@native-twin/css/jsx';
import type { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import type { TwinJSXElementNode, TwinJSXStyledProp } from '../Babel';
import type { InternalTwFn, InternalTwinConfig } from '../Config';

export class TwinJSXInjectInfo extends Data.Class<{
  sheetID: string;
  hasExpressions: boolean;
  isExternal: boolean;
  node: TwinJSXElementNode;
  isNative: boolean;
}> {}

// export class ProjectStyleSheet {
//   constructor(readonly modules: Iterable<BabelModuleSheet>) {}

//   get modulesMap() {
//     return new Map(
//       RA.fromIterable(this.modules).map((module) => [
//         module.module.file.path,
//         RA.fromIterable(module.jsxElementSheets),
//       ]),
//     );
//   }

//   getProjectSheets() {
//     return Stream.fromIterable(this.modules).pipe(
//       Stream.mapEffect((moduleSheet) =>
//         Effect.andThen(moduleSheet.getTwinSheet(), (data) => [moduleSheet, data]),
//       ),
//     );
//   }
// }

// export class BabelModuleSheet {
//   constructor(
//     readonly platform: TwinRunnerPlatform,
//     readonly module: TwinBabelModule,
//     readonly jsxElementSheets: TwinJSXElementSheet[],
//   ) {}

//   get moduleID() {
//     const fileID = Hash.string(this.module.file.path);

//     return Hash.combine(fileID)(
//       Hash.array(this.jsxElementSheets.map((x) => x.jsxElement.id)),
//     );
//   }

//   getTwinSheet() {
//     return Effect.gen(this, function* () {
//       const sheetRef = yield* Ref.make(new Map<string, TwinJSXInjectInfo>());
//       const sheetID = `${Hash.string(this.module.file.path)}/${this.moduleID}`;
//       yield* Stream.fromIterable(this.jsxElementSheets).pipe(
//         Stream.mapEffect((jsxElement) =>
//           traverseTreeEffect(jsxElement.sheetsTree, (treeNode) => {
//             const info = this.getJSXNodeInfo(treeNode);
//             return Ref.update(sheetRef, (x) =>
//               x.set(treeNode.value.jsxElementNode.id, info),
//             );
//           }),
//         ),
//         Stream.runDrain,
//       );
//       return {
//         sheetID,
//         sheets: yield* sheetRef,
//       };
//     });
//   }
// }

// export class TwinJSXElementSheet {
//   constructor(
//     readonly jsxElement: TwinJSXElement,
//     readonly sheetsTree: Tree.Tree<JSXElementNodeSheet>,
//   ) {}
// }

// export class JSXElementNodeSheet {
//   readonly childEntries: ComponentStyledProp['childEntries'];
//   constructor(
//     readonly jsxElementNode: TwinJSXElementNode,
//     readonly styledProps: ComponentStyledProp[],
//   ) {
//     this.childEntries = styledProps.flatMap((x) => x.childEntries);
//   }
// }

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

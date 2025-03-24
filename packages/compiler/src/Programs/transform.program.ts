import { StylesInterpreter, TwinDecl } from '@native-twin/css';
import type { SheetEntryParser } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import { type TwinJSXClassnameProp, TwinStyledProp } from '../Domain/JSXStyledProp';
import type { TwinBabelModule } from '../Domain/TwinBabelModule';
import type { TwinJSXElement } from '../Domain/TwinJSXElement';
import { TwinJsxNodeSheet, TwinJsxStyleSheet } from '../Domain/TwinJsxSheet';
import type { TwinTransformOptions } from '../Project/Model';
import { type CompilerStyleSheet, TwinStyleSheetContext } from '../StyleSheet';

export const transformModule = (module: TwinBabelModule, { platform }: TwinTransformOptions) =>
  Effect.gen(function* () {
    const { extractor } = yield* TwinStyleSheetContext;
    const twin = yield* extractor.getExtractor(platform);
    const sheetRef = yield* Ref.make(new Map<string, TwinJsxStyleSheet>());
    const interpreter = StylesInterpreter.make({ platform, rem: twin.ctx.baseRem });

    yield* Stream.fromIterable(module.jsxElements).pipe(
      Stream.mapEffect((jsxElement) => transformJSXElement(jsxElement, twin)),
      Stream.tap((sheet) => Ref.update(sheetRef, (x) => x.set(sheet.id, sheet))),
      Stream.runDrain,
    );

    return yield* Ref.get(sheetRef);

    function transformClassnameProp(prop: TwinJSXClassnameProp) {
      const styledProp = new TwinStyledProp(prop, twin.twinFn(prop.text));
      styledProp.parsedEntries
    }

    function transformParsedEntry(entry: SheetEntryParser) {
      Stream.fromIterable(entry.parsedDecls).pipe(
        Stream.map((x) => x.evaluated),
        Stream.map((x) => x?._tag),
      );
    }

    function transformJSXElement(jsxElement: TwinJSXElement, twin: CompilerStyleSheet) {
      return Stream.fromIterable(jsxElement.allNodes).pipe(
        Stream.map((treeNode) => {
          const styledProps = treeNode.value.classNameProps.map(
            (x) => new TwinStyledProp(x, twin.twinFn(x.text)),
          );
          return new TwinJsxNodeSheet(treeNode, styledProps);
        }),
        Stream.runCollect,
        Effect.map((nodes) => new TwinJsxStyleSheet(jsxElement, RA.fromIterable(nodes))),
      );
    }

    function transformJsxNodeSheet(nodeSheet: TwinJsxNodeSheet) {
      return Stream.fromIterable(nodeSheet.styledProps).pipe(
        Stream.flatMap((styledProp) =>
          Stream.fromIterable(styledProp.parsedEntries).pipe(
            Stream.map((parsedEntry) => transformParsedEntry(parsedEntry)),
          ),
        ),
      );
    }

    function transformStyledProp(styledProp: TwinStyledProp) {
      return Stream.fromIterable(styledProp.parsedEntries);
    }
  });

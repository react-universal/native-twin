import { type StylesInterpreter, TwinDecl } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import type { TwinJsxStyleSheet } from '../Domain/TwinJsxSheet';

export const prevalStyleSheet = (sheet: TwinJsxStyleSheet, interpreter: StylesInterpreter) =>
  Stream.fromIterable(sheet.nodes).pipe(
    Stream.flatMap((node) =>
      Stream.fromIterable(node.styledProps).pipe(
        Stream.map((prop) => {
          const decls = RA.flatMap(prop.entries, (entry) =>
            RA.map(entry.declarations, (x) => interpreter.evalDecl(TwinDecl.fromSheetEntryDecl(x))),
          );
          return { prop, compiled: decls };
        }),
      ),
    ),
    Stream.runCollect,
    Effect.map(RA.fromIterable),
  );

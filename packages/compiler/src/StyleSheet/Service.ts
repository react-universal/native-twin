import { parsedRuleToEntry } from '@native-twin/core';
import { getRuleSelectorGroups } from '@native-twin/css';
import { compileEntryDeclaration, Predicates } from '@native-twin/css/jsx';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import { TwinNodeContext } from '../Config';
import type { TwinJSXElement, TwinJSXElementNode } from '../Domain/TwinJSXElementNode';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const themeContext = yield* ctx.state.twThemeContext;
  const twinConfig = yield* ctx.state.twinConfig.get;

  return { getJSXElementNodeSheet };

  function getJSXElementNodeSheet(
    node: TwinJSXElementNode,
    jsxDeclarator: TwinJSXElement,
    platform: string,
  ) {
    return Stream.fromIterable(node.classNameProps).pipe(
      Stream.map((classNameProp) => {
        const entries = classNameProp.twinRules.map((rule) => {
          const sheetEntry = parsedRuleToEntry(rule, themeContext);
          const selectorGroups = getRuleSelectorGroups(rule.v);
          const compiledDecls = sheetEntry.declarations.map((x) =>
            compileEntryDeclaration(x, { baseRem: twinConfig.root.rem, platform }),
          );
          return {
            sheetEntry,
            selectorGroups,
            compiledDecls,
          };
        });
        return {
          expression: classNameProp.expression,
          entries,
          prop: classNameProp.prop,
          target: classNameProp.target,
          styles: {
            base: entries.filter((x) => x.selectorGroups.every((x) => x === 'base')),
            pointer: entries.filter((x) => x.selectorGroups.some(Predicates.isPointerSelector)),
            group: entries.filter((x) => x.selectorGroups.some(Predicates.isGroupSelector)),
            dark: entries.filter((x) => x.selectorGroups.some(Predicates.isDarkSelector)),
            child: entries.filter((x) => x.selectorGroups.some(Predicates.isChildSelector)),
          },
        };
      }),
      Stream.runCollect,
      Effect.map(Chunk.toArray),
      Effect.map((props) => ({
        props,
        declarator: {
          ...jsxDeclarator.meta,
          id: jsxDeclarator.id,
        },
        id: node.id,
        babelPath: node.babelPath,
        dependency: node.dependency,
        jsxElementName: node.name,
      })),
    );
  }
});

export interface TwinStyleSheetContext extends Effect.Effect.Success<typeof make> {}
export const TwinStyleSheetContext = Context.GenericTag<TwinStyleSheetContext>(
  '_____TwinStyleSheetContext',
);

export const TwinStyleSheetContextLive = Layer.effect(TwinStyleSheetContext, make);

import * as t from '@babel/types';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { TwinNodeContext } from '../Config';
import { literalValueToAst } from '../utils/babel/babel.utils';
import { TwinExtractor } from './Extractor';
import type { TwinJSXNodeStyledProp } from './Model';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const extractor = new TwinExtractor(ctx.state.twRunners.ref);

  return { extractor, buildNodeRuntimeProp };

  function buildNodeRuntimeProp(attr: TwinJSXNodeStyledProp) {
    const name = attr.jsxAttributeName;
    if (Option.isNone(attr.expression)) {
      const propValue = literalValueToAst(attr.entries);
      return [t.jsxAttribute(name), propValue];
    }
  }
});

export interface TwinStyleSheetContext extends Effect.Effect.Success<typeof make> {}
export const TwinStyleSheetContext = Context.GenericTag<TwinStyleSheetContext>(
  '_____TwinStyleSheetContext',
);

export const TwinStyleSheetContextLive = Layer.effect(TwinStyleSheetContext, make);

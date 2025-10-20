import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { TwinNodeContext } from '../Config';
import { TwinExtractor } from './Extractor';

// const encoder = new TextEncoder();
const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  // const fs = yield* TwinFSContext;
  const extractor = new TwinExtractor(ctx.state.twRunners.ref);
  // const globalObjs = Ref.make(HashMap.empty<string, unknown>());
  // const styleFile = fs.openFile('sfd', { flag: 'a+' });

  // const createStylesFile = (module: CompiledTwinBabelModule) =>
  //   Effect.gen(function* () {
  //     const tree = Stream.fromIterable(module.jsxElements);
  //     const fileName = module.module.id;
  //     const styleFile = yield* fs.openFile(fileName, { flag: 'a+' });
  //     styleFile.write(encoder.encode(module.module.id));
  //   });

  return { extractor };

  // function buildNodeRuntimeProp(attr: TwinJSXNodeStyledProp) {
  //   const name = attr.jsxAttributeName;
  //   if (Option.isNone(attr.expression)) {
  //     const propValue = literalValueToAst(attr.entries);
  //     return [t.jsxAttribute(name), propValue];
  //   }
  // }
});

export interface TwinStyleSheetContext extends Effect.Effect.Success<typeof make> {}
export const TwinStyleSheetContext = Context.GenericTag<TwinStyleSheetContext>(
  '_____TwinStyleSheetContext',
);

export const TwinStyleSheetContextLive = Layer.effect(TwinStyleSheetContext, make);

import { inspect } from 'util';
import type { SheetEntry } from '@native-twin/css';
import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import {
  type JSXMappedAttribute,
  type TwinBabelModule,
  type TwinDependenciesLookup,
  type TwinJSXElement,
  makeDependenciesLookup,
} from '../Babel';
import { TwinNodeContext, TwinNodeContextLive } from '../Config';
import type { TwinPath } from '../FileSystem';
import {
  ComponentStyledProp,
  JSXElementNodeSheet,
  TwinJSXElementSheet,
} from './JSXStyleSheet';
import type { CompilerStyleSheet, TwinExtractorFn } from './Model';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;

  const nativeModuleExtractor = createModulesExtractor(createExtractor('native'));
  const webModuleExtractor = createModulesExtractor(createExtractor('web'));

  return {
    extractors: {
      native: nativeModuleExtractor,
      web: webModuleExtractor,
    },
  };

  function createModulesExtractor(getExtractor: Effect.Effect<TwinExtractorFn>) {
    return (modules: Iterable<TwinBabelModule>) => {
      const lookup = makeDependenciesLookup(RA.fromIterable(modules));
      return Effect.andThen(getExtractor, (extractor) =>
        Stream.fromIterable(modules).pipe(
          Stream.runFold(
            new Map<TwinPath.FilePath, TwinJSXElementSheet[]>(),
            (acc, item) =>
              acc.set(item.file.path, extractModuleSheets(item, extractor, lookup)),
          ),
        ),
      );
    };
  }

  function extractModuleSheets(
    module: TwinBabelModule,
    extractor: TwinExtractorFn,
    lookup?: ReturnType<TwinDependenciesLookup>,
  ) {
    return RA.map(
      RA.fromIterable(module.jsxElements),
      (jsxElement) =>
        new TwinJSXElementSheet(
          jsxElement,
          getJSXElementSheet(jsxElement, extractor, lookup),
        ),
    );
  }

  function getJSXElementSheet(
    jsxElement: TwinJSXElement,
    extractor: TwinExtractorFn,
    lookup?: ReturnType<TwinDependenciesLookup>,
  ) {
    return RA.map(jsxElement.tree.all(), (treeNode) => {
      const breadcrumb = treeNode.getPath().map((x) => `${x.value.id}`);
      const styledProps = extractor(treeNode.value.styledProps);

      if (!lookup || Option.isNone(treeNode.value.dependency)) {
        return new JSXElementNodeSheet(styledProps, Option.none(), breadcrumb);
      }
      const found = lookup(treeNode.value);
      console.log('FOUND: ', inspect(found, false, 2, true));

      if (Option.isSome(found)) {
        breadcrumb.pop();
        breadcrumb.push(found.value.id);
      }

      return new JSXElementNodeSheet(styledProps, found, breadcrumb);
    });
  }

  function createStylesProcessor(f: (prop: JSXMappedAttribute) => SheetEntryHandler[]) {
    return (props: JSXMappedAttribute[]) =>
      props.map((prop) => new ComponentStyledProp(prop, f(prop)));
  }

  function createExtractor(platform: 'web' | 'native'): Effect.Effect<TwinExtractorFn> {
    return getPlatformRunner(platform).pipe(
      Effect.andThen((runner) =>
        createStylesProcessor(createSheetEntriesExtractor(runner.ctx, runner.twinFn)),
      ),
    );
  }

  function createSheetEntriesExtractor(
    ctx: CompilerStyleSheet['ctx'],
    getEntries: (from: string) => SheetEntry[],
  ) {
    return (prop: JSXMappedAttribute) =>
      RA.map(getEntries(prop.value.text), (x) => new SheetEntryHandler(x, ctx));
  }

  function getPlatformRunner(platform: 'web' | 'native') {
    return Effect.map(ctx.state.twRunners.get, ({ native, web }) =>
      platform === 'native' ? native : web,
    );
  }
});

export interface StyleSheetContext extends Effect.Effect.Success<typeof make> {}
export const StyleSheetContext =
  Context.GenericTag<StyleSheetContext>('StyleSheetContext');

export const StyleSheetContextLive = Layer.effect(StyleSheetContext, make).pipe(
  Layer.provide(TwinNodeContextLive),
);

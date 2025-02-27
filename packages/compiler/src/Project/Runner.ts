import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { TwinNodeContextLive } from '../Config';
import { TwinProjectContext, TwinProjectContextLive } from './Service';

const make = Effect.gen(function* () {
  const project = yield* TwinProjectContext;

  const projectRunner = project.modulesHandler.run(project.twinExtractor);

  return {
    projectRunner,
  };

  // function createModulesExtractor(getExtractor: Effect.Effect<TwinExtractorFn>) {
  //   return (modules: Iterable<TwinBabelModule>) => {
  //     const lookup = makeDependenciesLookup(RA.fromIterable(modules));
  //     return Effect.andThen(getExtractor, (extractor) =>
  //       Stream.fromIterable(modules).pipe(
  //         Stream.runFold(
  //           new Map<TwinPath.FilePath, TwinJSXElementSheet[]>(),
  //           (acc, item) =>
  //             acc.set(item.file.path, extractModuleSheets(item, extractor, lookup)),
  //         ),
  //       ),
  //     );
  //   };
  // }

  // function extractModuleSheets(
  //   module: TwinBabelModule,
  //   extractor: TwinExtractorFn,
  //   lookup?: ReturnType<TwinDependenciesLookup>,
  // ) {
  //   return RA.map(
  //     RA.fromIterable(module.jsxElements),
  //     (jsxElement) =>
  //       new TwinJSXElementSheet(
  //         jsxElement,
  //         getJSXElementSheet(jsxElement, extractor, lookup),
  //       ),
  //   );
  // }

  // function getJSXElementSheet(
  //   jsxElement: TwinJSXElement,
  //   extractor: TwinExtractorFn,
  //   lookup?: ReturnType<TwinDependenciesLookup>,
  // ) {
  //   return RA.map(jsxElement.tree.all(), (treeNode) => {
  //     const breadcrumb = treeNode.getPath().map((x) => `${x.value.id}`);
  //     const styledProps = extractor(treeNode.value.styledProps);

  //     if (!lookup || Option.isNone(treeNode.value.dependency)) {
  //       return new JSXElementNodeSheet(styledProps, Option.none(), breadcrumb);
  //     }
  //     const found = lookup(treeNode.value);
  //     console.log('FOUND: ', inspect(found, false, 2, true));

  //     if (Option.isSome(found)) {
  //       breadcrumb.pop();
  //       breadcrumb.push(found.value.id);
  //     }

  //     return new JSXElementNodeSheet(styledProps, found, breadcrumb);
  //   });
  // }

  // function createStylesProcessor(f: (prop: JSXMappedAttribute) => SheetEntryHandler[]) {
  //   return (props: JSXMappedAttribute[]) =>
  //     props.map((prop) => new ComponentStyledProp(prop, f(prop)));
  // }

  // function createExtractor(platform: 'web' | 'native'): Effect.Effect<TwinExtractorFn> {
  //   return getPlatformRunner(platform).pipe(
  //     Effect.andThen((runner) =>
  //       createStylesProcessor(createSheetEntriesExtractor(runner.ctx, runner.twinFn)),
  //     ),
  //   );
  // }

  // function createSheetEntriesExtractor(
  //   ctx: CompilerStyleSheet['ctx'],
  //   getEntries: (from: string) => SheetEntry[],
  // ) {
  //   return (prop: JSXMappedAttribute) =>
  //     RA.map(getEntries(prop.value.text), (x) => new SheetEntryHandler(x, ctx));
  // }
});

export interface TwinProjectRunnerContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectRunnerContext = Context.GenericTag<TwinProjectRunnerContext>(
  'TwinProjectRunnerContext',
);
export const TwinProjectRunnerContextLive = Layer.effect(
  TwinProjectRunnerContext,
  make,
).pipe(Layer.provide(TwinNodeContextLive), Layer.provide(TwinProjectContextLive));

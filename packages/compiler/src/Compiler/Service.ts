import * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import type {
  LoadedComponent,
  ModuleComponent,
  ResolvedModule,
} from '../Resolver/Models';
import { TwinResolverContext, TwinResolverContextLive } from '../Resolver/Service';
import { FSUtils, TwinPath } from '../internal/fs';
import {
  TwinNodeContext,
  TwinNodeContextLive,
} from '../services/TwinNodeContext.service';
import { CompiledComponent, CompiledModule, PlatformComponent } from './Models';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  yield* TwinPath.TwinPath;
  const resolver = yield* TwinResolverContext;

  return {
    getModuleComponents,
    compileProjectModules,
    compileFile,
  };

  function compileModuleComponent(platform: string, component: ModuleComponent) {
    return Effect.gen(function* () {
      const tree = Tree.mapTree<LoadedComponent, PlatformComponent>(
        component.tree,
        (node, parent) => new PlatformComponent(node.value, parent?.value),
      );
      return new CompiledComponent(component, tree);
    });
  }

  function compileProjectModules(platform: string) {
    return Stream.fromIterableEffect(resolver.resolveProjectModules()).pipe(
      Stream.mapEffect((module) => compileModule(module, platform)),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
    );
  }

  function compileModule(module: ResolvedModule, platform: string) {
    return Stream.fromIterable(module.components).pipe(
      Stream.mapEffect((component) => compileModuleComponent(platform, component)),
      Stream.runCollect,
      Effect.andThen((components) =>
        Effect.map(
          ctx.getTwForPlatform(platform),
          (twin) => new CompiledModule(module, twin, RA.fromIterable(components)),
        ),
      ),
    );
  }

  function compileFile(platform: string, filename: string, contents?: string) {
    return resolver
      .resolveFile(filename, contents)
      .pipe(Effect.andThen((module) => compileModule(module, platform)));
  }

  function getModuleComponents(module: ResolvedModule) {
    // return module.componentDefinitions.pipe(
    //   Stream.runCollect,
    //   Effect.map(RA.fromIterable),
    // );
  }
});

export interface TwinCompilerContext extends Effect.Effect.Success<typeof make> {}
export const TwinCompilerContext =
  Context.GenericTag<TwinCompilerContext>('TwinCompilerContext');

export const TwinCompilerContextLive = Layer.effect(TwinCompilerContext, make).pipe(
  Layer.provide(FSUtils.FsUtilsLive),
  Layer.provide(TwinPath.TwinPathLive),
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TwinResolverContextLive),
);

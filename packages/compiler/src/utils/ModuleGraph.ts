import { Array, Effect, HashMap, Iterable, Option, Ref, Stream } from 'effect';
import type { TwinBabelModule, TwinJSXElement } from '../Babel';

export const makeModulesGraph = (modules: TwinBabelModule[]) =>
  Effect.gen(function* () {
    const modulesStream = Stream.fromIterable(modules);
    const cache = yield* Ref.make(
      HashMap.empty<TwinBabelModule, Iterable<TwinJSXElement>>(),
    );

    const graph = modulesStream.pipe(
      Stream.map((module) => getModuleDependencies(module)),
    );

    return {
      graph,
    };

    function getModuleDependencies(module: TwinBabelModule) {
      return Effect.gen(function* () {
        const cachedValue = yield* Effect.map(Ref.get(cache), HashMap.get(module));

        if (Option.isSome(cachedValue)) return cachedValue.value;

        const dependencies_ = Iterable.filterMap(module.dependencies, (dep) =>
          Array.findFirst(modules, (x) => x.findDependency(dep)),
        );
        yield* Ref.update(cache, (map) => HashMap.set(map, module, dependencies_));

        return dependencies_;
      });
    }
  });

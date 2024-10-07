import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Cached from 'effect/Resource';

export class ConfigService extends Context.Tag('metro/global/config')<
  ConfigService,
  {
    platforms: Ref.Ref<HashSet.HashSet<string>>;
    watcherStatus: Ref.Ref<boolean>;
    addPlatform: (
      platform: string,
    ) => Effect.Effect<HashSet.HashSet<string>, never, never>;
    getPlatforms: () => Effect.Effect<HashSet.HashSet<string>, never, never>;
  }
>() {
  static Live = Layer.scoped(
    ConfigService,
    Effect.gen(function* () {
      const platformsRef = yield* Ref.make(HashSet.empty<string>());
      const watcherRef = yield* Ref.make(false);
      const cachedPlatforms = yield* Cached.manual(Ref.get(platformsRef));

      return {
        platforms: platformsRef,
        watcherStatus: watcherRef,
        addPlatform: (platform: string) =>
          Effect.gen(function* () {
            const current = yield* Ref.get(platformsRef);
            return yield* pipe(
              Ref.set(platformsRef, HashSet.add(current, platform)),
              Effect.zipRight(Cached.refresh(cachedPlatforms)),
              Effect.zipRight(Cached.get(cachedPlatforms)),
            );
          }),
        getPlatforms: () => Ref.get(platformsRef),
      };
    }),
  );
}

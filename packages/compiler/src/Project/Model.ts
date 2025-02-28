import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import type * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import type * as SubscriptionRef from 'effect/SubscriptionRef';
import type { TwinBabelModule } from '../Babel';
import type { TwinPath } from '../FileSystem';
import { listenForkedStreamChanges } from '../utils/effect.utils';

export class ModulesHandler {
  get: Effect.Effect<HashMap.HashMap<TwinPath.FilePath, TwinBabelModule>>;
  add: (module: TwinBabelModule) => Effect.Effect<void>;
  delete: (filepath: TwinPath.FilePath) => Effect.Effect<boolean>;
  find: (filepath: TwinPath.FilePath) => Effect.Effect<Option.Option<TwinBabelModule>>;

  constructor(
    private value: SubscriptionRef.SubscriptionRef<
      HashMap.HashMap<TwinPath.FilePath, TwinBabelModule>
    >,
  ) {
    this.get = Ref.get(this.value);
    this.find = (filepath) => Effect.map(this.value, HashMap.get(filepath));

    this.add = (babelModule) =>
      Ref.update(this.value, HashMap.set(babelModule.file.path, babelModule));

    this.delete = (filepath) =>
      Effect.andThen(
        Ref.updateAndGet(this.value, HashMap.remove(filepath)),
        HashMap.has(filepath),
      );
  }

  watch(
    onChange: (
      modules: HashMap.HashMap<TwinPath.FilePath, TwinBabelModule>,
    ) => Effect.Effect<void>,
  ) {
    return listenForkedStreamChanges(this.value.changes, onChange);
  }

  toStream() {
    return Stream.fromIterableEffect(this.get);
  }
}

import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';
import type { TwinRunnerPlatform } from '../Config';
import type { CompilerStyleSheet } from './Model';

export class TwinExtractor {
  get: Effect.Effect<TwinPlatformExtractors>;
  getExtractor: (platform: TwinRunnerPlatform) => Effect.Effect<CompilerStyleSheet>;

  constructor(private value: Ref.Ref<TwinPlatformExtractors>) {
    this.get = Ref.get(this.value);
    this.getExtractor = (platform: TwinRunnerPlatform) =>
      Effect.andThen(this.get, ({ native, web }) =>
        platform === 'native' ? native : web,
      );
  }
}

export interface TwinPlatformExtractors {
  native: CompilerStyleSheet;
  web: CompilerStyleSheet;
}

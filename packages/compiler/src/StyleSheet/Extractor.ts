import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';
import type { TwinJSXStyledProp } from '../Babel';
import { type CompilerStyleSheet, ComponentStyledProp } from './Model';
import type { TwinRunnerPlatform } from '../Config';

export class TwinExtractor {
  get: Effect.Effect<TwinPlatformExtractors>;
  getExtractor: (platform: TwinRunnerPlatform) => Effect.Effect<CompilerStyleSheet>;
  getStyledProps: (
    props: TwinJSXStyledProp[],
    platform: TwinRunnerPlatform,
  ) => Effect.Effect<ComponentStyledProp[]>;

  constructor(private value: Ref.Ref<TwinPlatformExtractors>) {
    this.get = Ref.get(this.value);
    this.getExtractor = (platform: TwinRunnerPlatform) =>
      Effect.andThen(this.get, ({ native, web }) =>
        platform === 'native' ? native : web,
      );

    this.getStyledProps = (props, platform) =>
      Effect.andThen(this.getExtractor(platform), (compiler) =>
        props.map((prop) => {
          const handlers = RA.map(
            compiler.twinFn(prop.text),
            (x) => new SheetEntryHandler(x, compiler.ctx),
          );
          return new ComponentStyledProp(prop, handlers);
        }),
      );
  }
}

export interface TwinPlatformExtractors {
  native: CompilerStyleSheet;
  web: CompilerStyleSheet;
}

import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';
import type { JSXMappedAttribute } from '../Babel';
import { ComponentStyledProp } from './JSXStyleSheet';
import type { CompilerStyleSheet, TwinRunnerPlatform } from './Model';

export interface TwinPlatformExtractors {
  native: CompilerStyleSheet;
  web: CompilerStyleSheet;
}

export class TwinExtractor {
  get: Effect.Effect<TwinPlatformExtractors>;
  getExtractor: (platform: TwinRunnerPlatform) => Effect.Effect<CompilerStyleSheet>;
  getStyledProps: (
    props: JSXMappedAttribute[],
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
            compiler.twinFn(prop.value.text),
            (x) => new SheetEntryHandler(x, compiler.ctx),
          );
          return new ComponentStyledProp(prop, handlers);
        }),
      );
  }
}

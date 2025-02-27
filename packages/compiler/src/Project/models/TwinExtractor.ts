import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';
import type { JSXMappedAttribute, TwinJSXElement } from '../../Babel';
import { type CompilerStyleSheet, ComponentStyledProp } from '../../StyleSheet';
import { mapTreeEffect } from '../../utils/tree.utils';
import type { Extractors, TwinRunnerPlatform } from '../Model';
import { CompiledTwinNodeElement } from './ProjectJSX';

export class TwinExtractor {
  get: Effect.Effect<Extractors>;
  getExtractor: (platform: 'web' | 'native') => Effect.Effect<CompilerStyleSheet>;
  getStyledProps: (
    props: JSXMappedAttribute[],
    platform: 'web' | 'native',
  ) => Effect.Effect<ComponentStyledProp[]>;

  constructor(private value: Ref.Ref<Extractors>) {
    this.get = Ref.get(this.value);
    this.getExtractor = (platform: 'native' | 'web') =>
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

  getCompiledTree(jsxElement: TwinJSXElement, platform: TwinRunnerPlatform) {
    return mapTreeEffect(jsxElement.tree, (node) =>
      Effect.map(
        this.getStyledProps(node.value.styledProps, platform),
        (compiledProps) => new CompiledTwinNodeElement(node.value, compiledProps),
      ),
    );
  }
}

import { Predicates, type TwinRuntimeComponent } from '@native-twin/css/jsx';
import * as Chunk from 'effect/Chunk';
import * as Data from 'effect/Data';
import { Sink } from 'effect/index';
import * as Stream from 'effect/Stream';
import type { TwinRunnerPlatform } from '../Config';
import type { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';
import type { CompiledSheetEntry, CompiledStyledProp, TwinEvaluatedStyle } from '../StyleSheet';
import { foldCompiledSheetEntriesSink } from './Utils';

export interface TwinTransformOptions {
  platform: TwinRunnerPlatform;
}

export interface EvaluatedStyledProp {
  compiledProp: CompiledStyledProp;
}

export class TransformedJSXNode extends Data.Class<{
  node: TwinJSXElementNode;
  styledProps: CompiledStyledProp[];
  parentStyles: CompiledSheetEntry[];
  index: number;
  parentSize: number;
  parentID: string | null;
}> {
  toRuntimeJSX(): TwinRuntimeComponent {
    const parentRuntimeStyles = this.parentStyles.map((x) => x.toRuntime(true));
    const runtimeProps = this.styledProps.map((x) => x.toRuntime(false));
    const childStyles = runtimeProps.flatMap((x) =>
      x.entries.filter((x) => x.groups.some(Predicates.isChildSelector)),
    );
    const finalProps = runtimeProps.map((prop) => {
      prop.entries = prop.entries
        .filter((x) => !x.groups.some(Predicates.isChildSelector))
        .concat(parentRuntimeStyles);
      return prop;
    });

    const metadata = {
      hasGroupEvents: runtimeProps.some((x) => x.metadata.hasGroupEvents),
      hasPointerEvents: runtimeProps.some((x) => x.metadata.hasPointerEvents),
      isGroupParent: runtimeProps.some((x) => x.metadata.isGroupParent),
    };
    return {
      id: this.node.id,
      index: this.index,
      metadata,
      parentID: this.parentID,
      parentSize: this.parentSize,
      props: finalProps,
      childStyles,
    };
  }
  evaluatedStyledProps() {
    if (this.styledProps.length === 0 && this.parentStyles.length > 0) {
      return Stream.fromIterable(this.parentStyles).pipe(
        Stream.transduce(
          foldCompiledSheetEntriesSink.pipe(
            Sink.map((x): TwinEvaluatedStyle => ({ node: this.node, prop: null, styles: x })),
          ),
        ),
      );
    }

    return Stream.fromIterable(this.styledProps).pipe(
      Stream.mapEffect((prop) => {
        return Stream.concatAll(
          Chunk.make(
            Stream.fromIterable(prop.baseStyles),
            Stream.fromIterable(prop.pointerStyles),
            Stream.fromIterable(prop.groupStyles),
            Stream.fromIterable(this.parentStyles),
            Stream.fromIterable(prop.darkStyles),
          ),
        ).pipe(
          Stream.run(
            foldCompiledSheetEntriesSink.pipe(
              Sink.map((x): TwinEvaluatedStyle => ({ node: this.node, prop, styles: x })),
            ),
          ),
        );
      }),
    );
  }
}

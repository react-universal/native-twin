import type { AnyStyle } from '@native-twin/css';
import { mergeCompiledDeclarations, type RuntimeSheetDeclaration } from '@native-twin/css/jsx';
import * as Chunk from 'effect/Chunk';
import * as Data from 'effect/Data';
import * as Sink from 'effect/Sink';
import * as Stream from 'effect/Stream';
import type { TwinRunnerPlatform } from '../Config';
import type { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';
import {
  type CompiledSheetEntry,
  type CompiledStyledProp,
  getEmptyEvaluatedEntry,
  type TwinEvaluatedEntryDecls,
} from '../StyleSheet/Model';

export interface TwinTransformOptions {
  platform: TwinRunnerPlatform;
}

export class TransformedJSXNode extends Data.Class<{
  node: TwinJSXElementNode;
  styledProps: CompiledStyledProp[];
  parentStyles: CompiledSheetEntry[];
}> {
  evaluate(compiledEntry: CompiledSheetEntry): TwinEvaluatedEntryDecls {
    const styles: AnyStyle = mergeCompiledDeclarations(compiledEntry.decls);
    const rawDecls: RuntimeSheetDeclaration[] = compiledEntry.decls.filter(
      (x) => x._tag === 'NOT_COMPILED',
    );
    return { styles, rawDecls };
  }
  foldEntriesSink = Sink.foldLeft(getEmptyEvaluatedEntry(), (prev, current: CompiledSheetEntry) => {
    const group = current.mainSelectorGroup;
    const evaluated = this.evaluate(current);
    let mutate: TwinEvaluatedEntryDecls;
    switch (group) {
      case 'base':
      case 'group':
      case 'pointer':
      case 'dark':
        mutate = prev[group];
        break;
      case 'first':
      case 'last':
      case 'odd':
      case 'even':
        mutate = prev.child[group];
        break;
    }

    Object.assign(mutate.styles, evaluated.styles);
    mutate.rawDecls.push(...evaluated.rawDecls);

    return prev;
  });

  evaluatedStyledProps() {
    if (this.styledProps.length === 0 && this.parentStyles.length > 0) {
      return Stream.fromIterable(this.parentStyles).pipe(Stream.transduce(this.foldEntriesSink));
    }

    return Stream.fromIterable(this.styledProps).pipe(
      Stream.flatMap((prop) => {
        return Stream.concatAll(
          Chunk.make(
            Stream.fromIterable(prop.baseStyles),
            Stream.fromIterable(prop.pointerStyles),
            Stream.fromIterable(prop.groupStyles),
            Stream.fromIterable(this.parentStyles),
            Stream.fromIterable(prop.darkStyles),
          ),
        );
      }),
      Stream.transduce(this.foldEntriesSink),
    );
  }
}

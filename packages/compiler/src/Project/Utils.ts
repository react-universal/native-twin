import type { AnyStyle } from '@native-twin/css';
import { mergeCompiledDeclarations, type RuntimeSheetDeclaration } from '@native-twin/css/jsx';
import * as Sink from 'effect/Sink';
import {
  type CompiledSheetEntry,
  getEmptyEvaluatedEntry,
  type TwinEvaluatedEntryDecls,
} from '../StyleSheet';

const evaluateCompiledEntry = (compiledEntry: CompiledSheetEntry): TwinEvaluatedEntryDecls => {
  const styles: AnyStyle = mergeCompiledDeclarations(compiledEntry.decls);
  const rawDecls: RuntimeSheetDeclaration[] = compiledEntry.decls.filter(
    (x) => x._tag === 'NOT_COMPILED',
  );
  return { styles, rawDecls };
};
export const foldCompiledSheetEntriesSink = Sink.suspend(() =>
  Sink.foldLeft(getEmptyEvaluatedEntry(), (prev, current: CompiledSheetEntry) => {
    const group = current.mainSelectorGroup;
    const evaluated = evaluateCompiledEntry(current);
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
  }),
);

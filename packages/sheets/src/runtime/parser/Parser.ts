import { updateParserError, updateParserResult } from './helpers';
import type { ParserFn, ParserState } from './types';

export class Parser {
  parserStateTransformerFn: ParserFn;
  constructor(parserStateTransformerFn: ParserFn) {
    this.parserStateTransformerFn = parserStateTransformerFn;
  }

  run(targetString: string) {
    const initialState: ParserState = {
      targetString,
      index: 0,
      result: null,
      error: null,
      isError: false,
    };

    return this.parserStateTransformerFn(initialState);
  }

  map<T>(fn: (result: ParserState['result']) => T) {
    return new Parser((parserState) => {
      const nextState = this.parserStateTransformerFn(parserState);

      if (nextState.isError) return nextState;

      return updateParserResult(nextState, fn(nextState.result));
    });
  }

  errorMap(fn: (error: ParserState['error'], index: number) => string) {
    return new Parser((parserState) => {
      const nextState = this.parserStateTransformerFn(parserState);
      if (!nextState.isError) return nextState;

      return updateParserError(nextState, fn(nextState.error, nextState.index));
    });
  }

  // Simulates: FlatMap || bind
  chain<T>(fn: (result: T) => Parser) {
    return new Parser((parserState) => {
      const nextState = this.parserStateTransformerFn(parserState);

      if (nextState.isError) return nextState;

      const nextParser = fn(nextState.result as T);

      return nextParser.parserStateTransformerFn(nextState);
    });
  }
}

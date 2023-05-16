import { matchLetters } from './combinator/letters';
import { updateParserError, updateParserResult } from './helpers';
import type { ParserFn, ParserState } from './types';

class Node<NodeType, NodeValue> {
  type: NodeType;
  value: NodeValue;
  constructor(type: NodeType, value: NodeValue) {
    this.type = type;
    this.value = value;
  }
}

export class Parser {
  parserStateTransformerFn: ParserFn;
  constructor(parserStateTransformerFn: ParserFn) {
    this.parserStateTransformerFn = parserStateTransformerFn;
  }

  run(targetString: string) {
    const initialState: ParserState = {
      targetString,
      index: 0,
      result: '',
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

type Fn<W> = (x: W) => W;
const compose =
  <T>(...fns: Array<Fn<T>>): Fn<T> =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const isL = compose(() => matchLetters);

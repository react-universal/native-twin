import { createParserState, ParserState, ResultType, updateParserResult } from './ParserState';

type StateTransformerFunction<T, E = any> = (
  state: ParserState<any, any>,
) => ParserState<T, E>;

export class Parser<T, E = string> {
  transform: StateTransformerFunction<T, E>;
  constructor(transform: StateTransformerFunction<T, E>) {
    this.transform = transform;
  }

  run(target: string): ResultType<T, E> {
    const state = createParserState(target);

    const resultState = this.transform(state);

    if (resultState.isError) {
      return {
        isError: true,
        error: resultState.error,
        cursor: resultState.cursor,
      };
    }

    return {
      isError: false,
      result: resultState.result,
      cursor: resultState.cursor,
    };
  }

  map<T2>(fn: (x: T) => T2): Parser<T2, E> {
    const parser = this.transform;
    return new Parser((state): ParserState<T2, E> => {
      const newState = parser(state);
      if (newState.isError) return newState as unknown as ParserState<T2, E>;
      return updateParserResult(newState, fn(newState.result));
    });
  }

  chain<T2>(fn: (x: T) => Parser<T2, E>): Parser<T2, E> {
    const p = this.transform;
    return new Parser((state): ParserState<T2, E> => {
      const newState = p(state);
      if (newState.isError) return newState as unknown as ParserState<T2, E>;
      return fn(newState.result).transform(newState);
    });
  }
}

export function skip<E>(parser: Parser<any, E>): Parser<null, E> {
  return new Parser((state) => {
    if (state.isError) return state;
    const nextState = parser.transform(state);
    if (nextState.isError) return nextState;

    return updateParserResult(nextState, state.result);
  });
}

export { between } from './common/between.parser';
export { choice } from './common/choice.parser';
export { coroutine } from './common/coroutine.parser';
export { lookAhead } from './common/lookahead';
export { many, many1 } from './common/many.parser';
export { maybe } from './common/maybe.parser';
export { peek } from './common/peek.parser';
export { recursiveParser } from './common/recursive.parser';
export { separatedBy } from './common/separated-by.parser';
export { sequenceOf } from './common/sequence-of';

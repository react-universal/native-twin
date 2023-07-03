import * as PS from './ParserState';

type StateTransformerFunction<T, E = any> = (
  state: PS.ParserState<any, any>,
) => PS.ParserState<T, E>;

export class Parser<T, E = string> {
  transform: StateTransformerFunction<T, E>;
  constructor(transform: StateTransformerFunction<T, E>) {
    this.transform = transform;
  }

  run(target: string): PS.ResultType<T, E> {
    const state = PS.createParserState(target);

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
    return new Parser((state): PS.ParserState<T2, E> => {
      const newState = parser(state);
      if (newState.isError) return newState as unknown as PS.ParserState<T2, E>;
      return PS.updateParserResult(newState, fn(newState.result));
    });
  }

  chain<T2>(fn: (x: T) => Parser<T2, E>): Parser<T2, E> {
    const p = this.transform;
    return new Parser((state): PS.ParserState<T2, E> => {
      const newState = p(state);
      if (newState.isError) return newState as unknown as PS.ParserState<T2, E>;
      return fn(newState.result).transform(newState);
    });
  }
}

export function skip<E>(parser: Parser<any, E>): Parser<null, E> {
  return new Parser((state) => {
    if (state.isError) return state;
    const nextState = parser.transform(state);
    if (nextState.isError) return nextState;

    return PS.updateParserResult(nextState, state.result);
  });
}

export function possibly<T, E>(parser: Parser<T, E>): Parser<T | null, E> {
  return new Parser((state) => {
    if (state.isError) return state;

    const nextState = parser.transform(state);
    return nextState.isError ? PS.updateParserResult(state, null) : nextState;
  });
}

export function lookAhead<T, E>(parser: Parser<T, E>): Parser<T, E> {
  return new Parser((state) => {
    if (state.isError) return state;
    const nextState = parser.transform(state);
    return nextState.isError
      ? PS.updateParserResult(state, state.result)
      : PS.updateParserResult(state, nextState.result);
  });
}

export const peek: Parser<string> = new Parser((state) => {
  if (state.isError) return state;

  const { cursor, target } = state;
  const sliced = target[cursor];
  if (sliced) {
    return PS.updateParserState(state, sliced[0], cursor);
  }
  return PS.updateParserError(
    state,
    `ParseError (position ${cursor}): Unexpected end of input.`,
  );
});

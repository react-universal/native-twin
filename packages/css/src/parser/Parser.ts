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

export function sequenceOf<A>([p1]: [Parser<A>]): Parser<[A]>;
export function sequenceOf<A, B>([p1, p2]: [Parser<A>, Parser<B>]): Parser<[A, B]>;
export function sequenceOf<A, B, C>([p1, p2, p3]: [Parser<A>, Parser<B>, Parser<C>]): Parser<
  [A, B, C]
>;
export function sequenceOf<A, B, C, D>([p1, p2, p3, p4]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
]): Parser<[A, B, C, D]>;
export function sequenceOf<A, B, C, D, E>([p1, p2, p3, p4, p5]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
]): Parser<[A, B, C, D, E]>;
export function sequenceOf<A, B, C, D, E, F>([p1, p2, p3, p4, p5, p6]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
]): Parser<[A, B, C, D, E, F]>;
export function sequenceOf(parsers: Parser<any, any>[]) {
  return new Parser((state) => {
    if (state.isError) return state;
    const length = parsers.length;
    const results = new Array(length);
    let nextState = state;

    for (let i = 0; i < length; i++) {
      const out = parsers[i]!.transform(nextState);

      if (out.isError) {
        return out;
      } else {
        nextState = out;
        results[i] = out.result;
      }
    }

    return PS.updateParserResult(nextState, results);
  });
}

export function choice<A>([p1]: [Parser<A>]): Parser<A>;
export function choice<A, B>([p1, p2]: [Parser<A>, Parser<B>]): Parser<A | B>;
export function choice<A, B, C>([p1, p2, p3]: [Parser<A>, Parser<B>, Parser<C>]): Parser<
  A | B | C
>;
export function choice<A, B, C, D>([p1, p2, p3, p4]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
]): Parser<A | B | C | D>;
export function choice<A, B, C, D, E>([p1, p2, p3, p4, p5]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
]): Parser<A | B | C | D | E>;
export function choice<A, B, C, D, E, F>([p1, p2, p3, p4, p5, p6]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
]): Parser<A | B | C | D | E | F>;
export function choice<A, B, C, D, E, F, G>([p1, p2, p3, p4, p5, p6]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
]): Parser<A | B | C | D | E | F | G>;
export function choice(parsers: Parser<any>[]): Parser<any> {
  return new Parser((state) => {
    if (state.isError) return state;

    let error = null;
    for (const parser of parsers) {
      const out = parser.transform(state);

      if (!out.isError) return out;

      if (error === null || (error && out.cursor > error.cursor)) {
        error = out;
      }
    }

    return error as PS.ParserState<any, any>;
  });
}

export const many = <A>(parser: Parser<A>): Parser<A[]> => {
  return new Parser((state) => {
    if (state.isError) return state;
    const results = [];
    let nextState = state;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const out = parser.transform(nextState);

      if (out.isError) {
        break;
      } else {
        nextState = out;
        results.push(nextState.result);
        if (nextState.cursor >= state.target.length) {
          break;
        }
      }
    }
    return PS.updateParserResult(nextState, results);
  });
};

export const many1 = <A>(parser: Parser<A>): Parser<A[]> => {
  return new Parser((state) => {
    if (state.isError) return state;
    // .shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)}
    const response = many(parser).transform(state);
    if (response.result.length) {
      return response;
    }
    return PS.updateParserError(
      state,
      `Many: does not have any result at position ${state.cursor} ${state.target.slice(
        state.cursor,
        5,
      )}`,
    );
  });
};

export const separatedBy =
  <S, E>(separatorParser: Parser<S, E>) =>
  <T>(valueParser: Parser<T, E>) => {
    return new Parser<T[]>((state) => {
      if (state.isError) return state;

      let nextState: PS.ParserState<S | T, E> = state;
      let error = null;
      const results: T[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const valState = valueParser.transform(nextState);
        const sepState = separatorParser.transform(valState);

        if (valState.isError) {
          error = valState;
          break;
        } else {
          results.push(valState.result);
        }

        if (sepState.isError) {
          nextState = valState;
          break;
        }

        nextState = sepState;
      }

      if (error) {
        if (results.length === 0) {
          return PS.updateParserResult(state, results) as PS.ParserState<T[], E>;
        }
        return error;
      }

      return PS.updateParserResult(nextState, results);
    });
  };

export const between =
  <L>(leftParser: Parser<L>) =>
  <R>(rightParser: Parser<R>) =>
  <T>(parser: Parser<T>): Parser<T> =>
    sequenceOf([leftParser, parser, rightParser]).map(([_, x]) => x);

export function recursiveParser<T, E>(parserThunk: () => Parser<T, E>): Parser<T, E> {
  return new Parser((state) => {
    return parserThunk().transform(state);
  });
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

type ParserFn<T> = (_yield: <K>(parser: Parser<K>) => K) => T;
export function coroutine<T>(parserFn: ParserFn<T>): Parser<T> {
  return new Parser((state) => {
    let currentValue;
    let currentState = state;

    const run = <T>(parser: Parser<T>) => {
      if (!(parser && parser instanceof Parser)) {
        throw new Error(`[coroutine] passed values must be Parsers, got ${parser}.`);
      }
      const newState = parser.transform(currentState);
      if (newState.isError) {
        throw newState;
      } else {
        currentState = newState;
      }
      currentValue = currentState.result;
      return currentValue;
    };

    try {
      const result = parserFn(run);
      return PS.updateParserResult(currentState, result);
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      } else {
        return e as PS.ParserState<any, any>;
      }
    }
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

export const everyCharUntil = (char: string): Parser<string> =>
  new Parser((state) => {
    if (state.isError) return state;
    const { cursor, target } = state;
    const sliced = target.slice(cursor);
    const nextIndex = sliced.indexOf(char);
    return PS.updateParserState(state, sliced.slice(0, nextIndex), cursor + nextIndex);
  });

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

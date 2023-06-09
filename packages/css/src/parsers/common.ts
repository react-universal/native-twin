import { Parser, ParserState, updateError, updateParserState, updateResult } from './Parser';

const reDigit = /[0-9]/;
const reLetters = /^[a-zA-Z]+/;

export function parseBetween<L, T, R>(
  leftParser: Parser<L>,
): (rightParser: Parser<R>) => (parser: Parser<T>) => Parser<T> {
  return function between$rightParser(rightParser) {
    return function between$parser(parser) {
      return parseSequenceOf([leftParser, parser, rightParser]).map(([_, x]) => x);
    };
  };
}

export const parseMany = function many<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser(function many$state(state) {
    if (state.isError) return state;

    const results = [];
    let nextState = state;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const out = parser.p(nextState);

      if (out.isError) {
        break;
      } else {
        nextState = out;
        results.push(nextState.result);

        if (nextState.index >= out.target.length) {
          break;
        }
      }
    }

    return updateResult(nextState, results);
  });
};

// many1 :: Parser e s a -> Parser e s [a]
export const parseManyOrOne = function many1<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser(function many1$state(state) {
    if (state.isError) return state;

    const resState = parseManyOrOne(parser).p(state);
    if (resState.result.length) return resState;

    return updateError(
      state,
      `ParseError 'many1' (position ${state.index}): Expecting to match at least one value`,
    );
  });
};

export function possibly<T, E, D>(parser: Parser<T, E, D>): Parser<T | null, E, D> {
  return new Parser(function possibly$state(state) {
    if (state.isError) return state;

    const nextState = parser.p(state);
    return nextState.isError ? updateResult(state, null) : nextState;
  });
}

export const parseDigit: Parser<string> = new Parser<string>(function digit$state(state) {
  if (state.isError) return state;

  const { target, index } = state;

  if (target.length > index) {
    if (index <= target.length) {
      const char = target.charAt(index);
      return char && reDigit.test(char)
        ? updateParserState(state, char, index + 1)
        : updateError(state, `ParseError (position ${index}): Expecting digit, got '${char}'`);
    }
  }

  return updateError(
    state,
    `ParseError (position ${index}): Expecting digit, but got end of input.`,
  );
});

export const peek: Parser<string> = new Parser(function peek$state(state) {
  if (state.isError) return state;

  const { index, target } = state;
  if (index < target.length) {
    return updateParserState(state, target.charAt(index), index);
  }
  return updateError(state, `ParseError (position ${index}): Unexpected end of input.`);
});

export function recursiveParser<T, E, D>(parserThunk: () => Parser<T, E, D>): Parser<T, E, D> {
  return new Parser(function recursiveParser$state(state) {
    return parserThunk().p(state);
  });
}

export function parseSeparatedBy<S, T, E, D>(
  sepParser: Parser<S, E, D>,
): (valueParser: Parser<T, E, D>) => Parser<T[]> {
  return function sepBy$valParser(valueParser) {
    return new Parser<T[]>(function sepBy$valParser$state(state) {
      if (state.isError) return state;

      let nextState: ParserState<S | T, E, D> = state;
      let error = null;
      const results: T[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const valState = valueParser.p(nextState);
        const sepState = sepParser.p(valState);

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
          return updateResult(state, results) as ParserState<T[], E, D>;
        }
        return error;
      }

      return updateResult(nextState, results);
    });
  };
}

export const parseEndOfInput = new Parser<null, string>(function endOfInput$state(state) {
  if (state.isError) return state;
  const { target, index } = state;
  if (index != target.length) {
    return updateError(
      state,
      `ParseError 'endOfInput' (position ${index}): Expected end of input but got '${target.slice(
        index,
        5,
      )}'`,
    );
  }

  return updateResult(state, null);
});

export const parseEveryCharUntil = (parser: Parser<any>) =>
  parseEverythingUntil(parser).map((results) => results.join(''));

export const parseEverythingUntil = (parser: Parser<any>): Parser<number[]> => {
  return new Parser((state) => {
    if (state.isError) return state;

    const results = [];
    let nextState = state;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const out = parser.p(nextState);

      if (out.isError) {
        const { index, target } = nextState;

        if (target.length <= index) {
          return updateError(
            nextState,
            `ParseError 'everythingUntil' (position ${nextState.index}): Unexpected end of input.`,
          );
        }

        const val = target.charAt(out.index);
        if (val) {
          results.push(val);
          nextState = updateParserState(nextState, val, index + 1);
        }
      } else {
        break;
      }
    }

    return updateResult(nextState, results);
  });
};

export function parseLiteral(s: string): Parser<string> {
  if (!s || s.length < 1) {
    throw new TypeError(`str must be called with a string with length > 1, but got ${s}`);
  }

  return new Parser(function str$state(state) {
    const { index, target } = state;
    const literalString = target.slice(index, s.length);

    const remainingBytes = target.length - index;
    if (remainingBytes < literalString.length) {
      return updateError(
        state,
        `ParseError (position ${index}): Expecting string '${s}', but got end of input.`,
      );
    }
    const stringAtIndex = target.slice(index, index + s.length);
    return s === stringAtIndex
      ? updateParserState(state, s, index + s.length)
      : updateError(
          state,
          `ParseError (position ${index}): Expecting string '${s}', got '${stringAtIndex}...'`,
        );
  });
}

export const parseLetters: Parser<string> = parseRegex(reLetters).errorMap(
  ({ index }) => `ParseError (position ${index}): Expecting letters`,
);

type ParserFn<T> = (_yield: <K>(parser: Parser<K>) => K) => T;

export function coroutine<T>(parserFn: ParserFn<T>): Parser<T> {
  return new Parser(function coroutine$state(state) {
    let currentValue;
    let currentState = state;

    const run = <T>(parser: Parser<T>) => {
      if (!(parser && parser instanceof Parser)) {
        throw new Error(`[coroutine] passed values must be Parsers, got ${parser}.`);
      }
      const newState = parser.p(currentState);
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
      return updateResult(currentState, result);
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      } else {
        return e as ParserState<any, any, any>;
      }
    }
  });
}

export function parseRegex(re: RegExp): Parser<string> {
  const typeofre = Object.prototype.toString.call(re);
  if (typeofre !== '[object RegExp]') {
    throw new TypeError(`regex must be called with a Regular Expression, but got ${typeofre}`);
  }

  if (re.toString()[1] !== '^') {
    throw new Error(`regex parsers must contain '^' start assertion.`);
  }

  return new Parser(function regex$state(state) {
    if (state.isError) return state;
    const { target, index } = state;
    const rest = target.slice(index, target.length - index);

    if (rest.length >= 1) {
      const match = rest.match(re);
      return match
        ? updateParserState(state, match[0], index + match[0].length)
        : updateError(
            state,
            `ParseError (position ${index}): Expecting string matching '${re}', got '${rest.slice(
              0,
              5,
            )}...'`,
          );
    }
    return updateError(
      state,
      `ParseError (position ${index}): Expecting string matching '${re}', but got end of input.`,
    );
  });
}

export const parseAnyChar: Parser<string> = new Parser(function anyChar$state(state) {
  if (state.isError) return state;

  const { index, target } = state;
  if (index < target.length) {
    const charWidth = target.slice(index).length;
    if (index + charWidth <= target.length) {
      const char = target.charAt(index);
      return updateParserState(state, char, index + charWidth);
    }
  }
  return updateError(
    state,
    `ParseError (position ${index}): Expecting a character, but got end of input.`,
  );
});

export const parseChar = function char(c: string): Parser<string> {
  if (!c || c.length != 1) {
    throw new TypeError(`char must be called with a single character, but got ${c}`);
  }

  return new Parser(function char$state(state) {
    if (state.isError) return state;
    const { index, target } = state;
    if (index < target.length) {
      const char = target.charAt(index);
      return char === c
        ? updateParserState(state, c, index + char.length)
        : updateError(
            state,
            `ParseError (position ${index}): Expecting character '${c}', got '${char}', (target): '${target.slice(
              index,
              index + 5,
            )}'`,
          );
    }
    return updateError(
      state,
      `ParseError (position ${index}): Expecting character '${c}', but got end of input.`,
    );
  });
};

export function tapParser<T, E, D>(
  fn: (state: ParserState<T, E, D>) => void,
): Parser<T, E, D> {
  return new Parser(function tapParser$state(state) {
    fn(state);
    return state;
  });
}

export function parseChoice<A>([p1]: [Parser<A>]): Parser<A>;
export function parseChoice<A, B>([p1, p2]: [Parser<A>, Parser<B>]): Parser<A | B>;
export function parseChoice<A, B, C>([p1, p2, p3]: [Parser<A>, Parser<B>, Parser<C>]): Parser<
  A | B | C
>;
export function parseChoice<A, B, C, D>([p1, p2, p3, p4]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
]): Parser<A | B | C | D>;
export function parseChoice<A, B, C, D, E>([p1, p2, p3, p4, p5]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
]): Parser<A | B | C | D | E>;
export function parseChoice<A, B, C, D, E, F>([p1, p2, p3, p4, p5, p6]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
]): Parser<A | B | C | D | E | F>;
export function parseChoice<A, B, C, D, E, F, G>([p1, p2, p3, p4, p5, p6, p7]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
]): Parser<A | B | C | D | E | F | G>;
export function parseChoice<A, B, C, D, E, F, G, H>([p1, p2, p3, p4, p5, p6, p7, p8]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
]): Parser<A | B | C | D | E | F | G | H>;
export function parseChoice<A, B, C, D, E, F, G, H, I>([p1, p2, p3, p4, p5, p6, p7, p8, p9]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
]): Parser<A | B | C | D | E | F | G | H | I>;
export function parseChoice<A, B, C, D, E, F, G, H, I, J>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
]): Parser<A | B | C | D | E | F | G | H | I | J>;
export function parseChoice<A, B, C, D, E, F, G, H, I, J, K>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
]): Parser<A | B | C | D | E | F | G | H | I | J | K>;
export function parseChoice<A, B, C, D, E, F, G, H, I, J, K, L>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
]): Parser<A | B | C | D | E | F | G | H | I | J | K | L>;
export function parseChoice<A, B, C, D, E, F, G, H, I, J, K, L, M>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
  p13,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
  Parser<M>,
]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M>;
export function parseChoice<A, B, C, D, E, F, G, H, I, J, K, L, M, N>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
  p13,
  p14,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
  Parser<M>,
  Parser<N>,
]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N>;
export function parseChoice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
  p13,
  p14,
  p15,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
  Parser<M>,
  Parser<N>,
  Parser<O>,
]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O>;
export function parseChoice(parsers: Parser<any>[]): Parser<any>;
export function parseChoice(parsers: Parser<any>[]): Parser<any> {
  if (parsers.length === 0) throw new Error(`List of parsers can't be empty.`);

  return new Parser(function parseChoice$state(state) {
    if (state.isError) return state;

    let error = null;
    for (const parser of parsers) {
      const out = parser.p(state);

      if (!out.isError) return out;

      if (error === null || (error && out.index > error.index)) {
        error = out;
      }
    }

    return error as ParserState<any, any, any>;
  });
}

export function parseSequenceOf<A>([p1]: [Parser<A>]): Parser<[A]>;
export function parseSequenceOf<A, B>([p1, p2]: [Parser<A>, Parser<B>]): Parser<[A, B]>;
export function parseSequenceOf<A, B, C>([p1, p2, p3]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
]): Parser<[A, B, C]>;
export function parseSequenceOf<A, B, C, D>([p1, p2, p3, p4]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
]): Parser<[A, B, C, D]>;
export function parseSequenceOf<A, B, C, D, E>([p1, p2, p3, p4, p5]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
]): Parser<[A, B, C, D, E]>;
export function parseSequenceOf<A, B, C, D, E, F>([p1, p2, p3, p4, p5, p6]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
]): Parser<[A, B, C, D, E, F]>;
export function parseSequenceOf<A, B, C, D, E, F, G>([p1, p2, p3, p4, p5, p6, p7]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
]): Parser<[A, B, C, D, E, F, G]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H>([p1, p2, p3, p4, p5, p6, p7, p8]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
]): Parser<[A, B, C, D, E, F, G, H]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H, I>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
]): Parser<[A, B, C, D, E, F, G, H, I]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H, I, J>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
]): Parser<[A, B, C, D, E, F, G, H, I, J]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H, I, J, K>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
]): Parser<[A, B, C, D, E, F, G, H, I, J, K]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H, I, J, K, L>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
  p13,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
  Parser<M>,
]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L, M]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M, N>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
  p13,
  p14,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
  Parser<M>,
  Parser<N>,
]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L, M, N]>;
export function parseSequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>([
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
  p13,
  p14,
  p15,
]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
  Parser<I>,
  Parser<J>,
  Parser<K>,
  Parser<L>,
  Parser<M>,
  Parser<N>,
  Parser<O>,
]): Parser<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O]>;
export function parseSequenceOf(parsers: Parser<any>[]): Parser<any[]>;
export function parseSequenceOf(parsers: Parser<any>[]): Parser<any[]> {
  return new Parser(function parseSequenceOf$state(state) {
    if (state.isError) return state;

    const length = parsers.length;
    const results = new Array(length);
    let nextState = state;

    for (let i = 0; i < length; i++) {
      const current = parsers[i];
      if (!current) throw new Error('');
      const out = current.p(nextState);

      if (out.isError) {
        return out;
      } else {
        nextState = out;
        results[i] = out.result;
      }
    }

    return updateResult(nextState, results);
  });
}

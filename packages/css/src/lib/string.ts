import { Parser, updateError, updateParserState, updateResult } from './Parser';

// parseChar :: Char -> Parser e Char s
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

// anyChar :: Parser e Char s
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

const reLetters = /^[a-zA-Z]+/;
// regex :: RegExp -> Parser e String s
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

export const parseLetters: Parser<string> = parseRegex(reLetters).errorMap(
  ({ index }) => `ParseError (position ${index}): Expecting letters`,
);

// literal :: String -> Parser e String s
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

// everythingUntil :: Parser e a s -> Parser e String s
export function parseEverythingUntil(parser: Parser<any>): Parser<number[]> {
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
}

// everyCharUntil :: Parser e a s -> Parser e String s
export const parseEveryCharUntil = (parser: Parser<any>) =>
  parseEverythingUntil(parser).map((results) => results.join(''));

// endOfInput :: Parser e Null s
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

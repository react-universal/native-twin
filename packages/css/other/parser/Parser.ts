interface IParser<A> {
  (cs: string): [A, string][];
}

export interface Parser<A> extends IParser<A> {
  chain: <B>(f: (v: A) => Parser<B>) => Parser<B>;
  // map: <B>(f: (v: A) => B) => Parser<B>;
  apply: <B>(fab: Parser<(a: A) => B>) => Parser<B>;
}

export const concat: any = [].concat.apply.bind([].concat, []);

export const makeParser = <A>(p: IParser<A>): Parser<A> => {
  const currentParser = p as Parser<A>;

  // currentParser.map = <B>(f: (v: A) => B) => currentParser.chain((v) => unit(f(v)));

  currentParser.chain = <B>(f: (v: A) => Parser<B>) =>
    makeParser<B>((cs) => concat(p(cs).map((res) => f(res[0])(res[1]))));

  return currentParser;
};

/**
 * @group parser
 */
export const item = makeParser((cs) => (cs[0] ? [[cs[0], cs.slice(1)]] : []));

/**
 * @group parser
 */
export const unit = <A>(a: A): Parser<A> => makeParser((cs) => [[a, cs]]);

/**
 * @group combinator
 */
export const plus = <A>(p: Parser<A>, q: Parser<A>): Parser<A> => {
  return makeParser((cs) => p(cs).concat(q(cs)));
};

/**
 * @group combinator
 */
export const plus1 = <A>(p: Parser<A>, q: Parser<A>) =>
  makeParser((cs) => {
    const res = plus<A>(p, q)(cs);
    return res.length && res[0] ? [res[0]] : [];
  });

/**
 * Only parses the input if predicate is true
 * @group parser
 */
export const satisfies = (predicate: (v: string) => boolean): Parser<string> =>
  item.chain((x) => (predicate(x) ? unit(x) : zero<string>()));

export function choice(parsers: Parser<any>[]): Parser<any> {
  return makeParser((cs) => {
    for (const currentParser of parsers) {
      const nextState = currentParser(cs);
      if (nextState.length > 0) {
        return nextState;
      }
    }
    return [];
  });
}

export const zero = <T>() => makeParser<T>((_) => []);

export function absurd<A>(_?: never): A {
  throw new Error('Calling `absurd` function which should never be called.');
}

export const apply = <A>(p: Parser<A>, cs: string): [A, string][] => space.chain((_) => p)(cs);

export const possibly = <A>(p: Parser<A | null>) =>
  makeParser((cs) => {
    const result = p(cs);
    if (result.length === 0) {
      return [[null as A, cs]];
    }
    return result;
  });

export const many1 = <A>(p: Parser<A>): Parser<A[]> =>
  p.chain((x) => many(p).chain((xs) => unit([x].concat(xs))));

export const many = <A>(p: Parser<A>): Parser<A[]> => plus1(many1(p), unit([]));

/**
 * @group combinator
 */
export const sequence = <A, B>(p: Parser<A>, q: Parser<B>): Parser<[A, B]> => {
  return p.chain((x) => q.chain((y) => unit<[A, B]>([x, y])));
};

export const separatedBy = <A>(p: Parser<A>, sep: Parser<A>) =>
  plus(separatedBy1(p, sep), unit([]));

export const separatedBy1 = <A, B>(p: Parser<A>, sep: Parser<B>): Parser<A[]> =>
  p.chain((x) => many(sep.chain((_) => p)).chain((xs) => unit([x].concat(xs))));

export const token = <A>(p: Parser<A>): Parser<A> =>
  p.chain((a) => space.chain((_) => unit(a)));

export const symbol = (cs: string): Parser<string> => token(literal(cs));

export const chainLeft = <A>(p: Parser<A>, op: Parser<(a: A) => (b: A) => A>): Parser<A> => {
  var rest = (x: A): Parser<A> =>
    plus1(
      op.chain((f) => p.chain((y) => rest(f(x)(y)))),
      unit(x),
    );
  return p.chain(rest);
};

// Lexical Combinators

/**
 * @group lexical combinator
 */
export const space = many(satisfies((x) => x == ' '));

const reLetters = /^[a-zA-Z]+/;

export const regex = (re: RegExp): Parser<string> =>
  makeParser((state) => {
    if (state.length === 0) return [];

    const match = state.match(re);
    return match?.[0] ? [[state.slice(0, match[0].length), state.slice(match[0].length)]] : [];
  });

export const letters: Parser<string> = regex(reLetters);

/**
 * @group lexical combinator
 */
export const char = <A extends string>(x: A) => satisfies((y) => y == x);

/**
 * @group lexical combinator
 */
export const literal = <A extends string>(x: A): Parser<A> =>
  makeParser((cs) => {
    const textLength = x.length;
    const match = cs.slice(0, textLength);
    if (match === x) {
      return [[match as A, cs.slice(textLength)]];
    }
    return [];
  });

const reDigits = /^[0-9]+/;
export const digits: Parser<string> = regex(reDigits);

export const validNumber = token(
  choice([possibly(char('-')), possibly(char('+'))]).chain((x) =>
    many(plus(digits, char('.'))).chain((y) => (x ? unit(x + y.join('')) : unit(y.join('')))),
  ),
);

export const alphanumeric = plus(letters, digits);

export const betweenParens = <A>(p: Parser<A>) =>
  char('(').chain((_) => p.chain((x) => char(')').chain((_) => unit(x))));

export const betweenBrackets = <A>(p: Parser<A>) =>
  char('{').chain((_) => p.chain((x) => char('}').chain((_) => unit(x))));

export const commaSeparated = <A>(p: Parser<A>) =>
  p.chain((x) => many(literal(', ').chain((_) => p)).chain((xs) => unit([x].concat(xs))));

/**
 * separated by space
 */
export const parseSpaceSeparated = <A>(p: Parser<A>) =>
  p.chain((x) => many(char(' ').chain((_) => p)).chain((y) => unit([x].concat(y))));

/**
 * separated by ":"
 */
export const parseColonSeparated = <A>(p: Parser<A>) =>
  p.chain((x) => many(literal(':').chain((_) => p)).chain((xs) => unit([x].concat(xs))));

/**
 * separated by ";"
 */
export const parseSemiColonSeparated = <A>(p: Parser<A>) =>
  p.chain((x) => many(literal(';').chain((_) => p)).chain((xs) => unit([x].concat(xs))));

export const recursiveParser = <A>(parserThunk: () => Parser<A>): Parser<A> =>
  makeParser((state) => parserThunk()(state));

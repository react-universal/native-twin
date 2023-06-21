interface IParser<A> {
  (cs: string): [A, string][];
}
// >>=>
export interface Parser<A> extends IParser<A> {
  /**
   * chain: the same as (flatMap, bind >>=) (the fish operator)
   *
   * @type {<B>(f: (v: A) => Parser<B>) => Parser<B>}
   */
  chain: <B>(f: (v: A) => Parser<B>) => Parser<B>;
  map: <B>(f: (v: A) => B) => Parser<B>;
  apply: <B>(fab: Parser<(a: A) => B>) => Parser<B>;
}

export const concat: any = [].concat.apply.bind([].concat, []);

export const makeParser = <A>(p: IParser<A>): Parser<A> => {
  const parser = p as Parser<A>;

  parser.map = <B>(f: (v: A) => B) => parser.chain((v) => unit(f(v)));

  parser.chain = <B>(f: (v: A) => Parser<B>) =>
    makeParser<B>((cs) => concat(p(cs).map((res) => f(res[0])(res[1]))));

  return parser;
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
export const sequence = <A, B>(p: Parser<A>, q: Parser<B>): Parser<[A, B]> => {
  return p.chain((x) => q.chain((y) => unit<[A, B]>([x, y])));
};

/**
 * @group combinator
 */
export const plus = <A>(p: Parser<A>, q: Parser<A>): Parser<A> => {
  return makeParser((cs) => p(cs).concat(q(cs)));
};

/**
 * @group combinator
 */
export const plus1 = <A>(p: Parser<A>, q: Parser<A>) => {
  return makeParser((cs) => {
    const res = plus<A>(p, q)(cs);
    return res.length && res[0] ? [res[0]] : [];
  });
};

/**
 * Only parses the input if predicate is true
 * @group parser
 */
export const satisfies = (predicate: (v: string) => boolean): Parser<string> => {
  return item.chain((x) => (predicate(x) ? unit(x) : zero<string>()));
};

export const choice = (parsers: Parser<any>[]): Parser<any> =>
  makeParser((cs) => {
    for (const currentParser of parsers) {
      const nextState = currentParser(cs);
      if (nextState.length > 0) {
        return nextState;
      }
    }
    return [];
  });

export const zero = <T>() => makeParser<T>((_) => []);

export function absurd<A>(_?: never): A {
  throw new Error('Calling `absurd` function which should never be called.');
}

export const apply = <A>(p: Parser<A>, cs: string): [A, string][] => space.chain((_) => p)(cs);

export const many1 = <A>(p: Parser<A>): Parser<A[]> =>
  p.chain((x) => many(p).chain((xs) => unit([x].concat(xs))));

export const many = <A>(p: Parser<A>): Parser<A[]> => plus1(many1(p), unit([]));

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

/**
 * @group lexical combinator
 */
export const digit = satisfies((x) => x >= '0' && x <= '9');

/**
 * @group lexical combinator
 */
const lower = satisfies((x) => x >= 'a' && x <= 'z');

/**
 * @group lexical combinator
 */
const upper = satisfies((x) => x >= 'A' && x <= 'Z');

/**
 * @group lexical combinator
 */
export const letter = plus(lower, upper);

/**
 * @group lexical combinator
 */
export const alphaNumeric = plus(letter, digit);

/**
 * @group lexical combinator
 */
// const identifier = lower.chain((x) => many(alphaNumeric).chain((xs) => unit(x + xs)));

/**
 * @group lexical combinator
 */
export const char = (x: string) => satisfies((y) => y == x);

/**
 * @group lexical combinator
 */
export const literal = <A extends string>(x: A): Parser<A> =>
  x.length && x[0]
    ? char(x[0])
        .chain((c) => literal(x.slice(1)).chain((cs) => unit(c + cs)))
        .map((r: any) => r)
    : unit('');

export const parseWithDebugLogs = <A>(p: Parser<A>): Parser<A> =>
  makeParser((cs) => {
    const debugState = p(cs);
    // eslint-disable-next-line no-console
    console.debug('DEBUG PARSER: ', { cs, debugState });
    return debugState;
  });

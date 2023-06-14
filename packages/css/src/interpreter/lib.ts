interface IParser<A> {
  (cs: string): [A, string][];
}

export interface Parser<A> extends IParser<A> {
  bind: <B>(f: (v: A) => Parser<B>) => Parser<B>;
}

export interface Monad<A> {
  unit: (v: A) => Monad<A>;
  bind: <B>(functor: Monad<A>) => (fa: (a: A) => Monad<B>) => Monad<B>;
}

export const concat: any = [].concat.apply.bind([].concat, []);

export const makeParser = <A>(p: IParser<A>): Parser<A> => {
  const parser = p as Parser<A>;
  parser.bind = <B>(f: (v: A) => Parser<B>) =>
    makeParser<B>((cs) =>
      concat(
        p(cs).map((res) => {
          return f(res[0])(res[1]);
        }),
      ),
    );
  return parser;
};

/**
 * @group parser
 */
const item = makeParser((cs) => (cs.length && cs[0] ? [[cs[0], cs.slice(1)]] : []));

/**
 * @group parser
 */
export const unit = <A>(a: A): Parser<A> => makeParser((cs) => [[a, cs]]);

/**
 * @group combinator
 */
export const sequence = <A, B>(p: Parser<A>, q: Parser<B>): Parser<[A, B]> => {
  return p.bind((x) => q.bind((y) => unit<[A, B]>([x, y])));
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
const satisfies = (predicate: (v: string) => boolean): Parser<string> => {
  return item.bind((x) => (predicate(x) ? unit(x) : zero<string>()));
};

export const zero = <T>() => makeParser<T>((_) => []);

export function absurd<A>(_?: never): A {
  throw new Error('Calling `absurd` function which should never be called.');
}

export const apply = <A>(p: Parser<A>, cs: string): [A, string][] => space.bind((_) => p)(cs);

export const many1 = <A>(p: Parser<A>): Parser<A[]> =>
  p.bind((x) => many(p).bind((xs) => unit([x].concat(xs))));

export const many = <A>(p: Parser<A>): Parser<A[]> => plus1(many1(p), unit([]));

// const separatedBy = <A>(p: Parser<A>, sep: Parser<A>) => plus1(separatedBy1(p, sep), unit([]));

// const separatedBy1 = <A, B>(p: Parser<A>, sep: Parser<B>): Parser<A[]> =>
//   p.bind((x) => many(sep.bind((_) => p)).bind((xs) => unit([x].concat(xs))));

// const token = <A>(p: Parser<A>): Parser<A> => p.bind((a) => space.bind((_) => unit(a)));
// const symbol = (cs: string): Parser<string> => token(literal(cs));

export const chainLeft = <A>(p: Parser<A>, op: Parser<(a: A) => (b: A) => A>): Parser<A> => {
  var rest = (x: A): Parser<A> =>
    plus1(
      op.bind((f) => p.bind((y) => rest(f(x)(y)))),
      unit(x),
    );
  return p.bind(rest);
};

// const chainLeft = <A>(p: Parser<A>, op: Parser<(a: A) => (b: A) => A>, a: A) =>
//   plus1(chainLeft1(p, op), unit(a));

// Lexical Combinators

/**
 * @group lexical combinator
 */
const space = many(satisfies((x) => x == ' '));

/**
 * @group lexical combinator
 */
const digit = satisfies((x) => x >= '0' && x <= '9');

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
const letter = plus(lower, upper);

/**
 * @group lexical combinator
 */
export const alphaNumeric = plus(letter, digit);

/**
 * @group lexical combinator
 */
// const identifier = lower.bind((x) => many(alphaNumeric).bind((xs) => unit(x + xs)));

/**
 * @group lexical combinator
 */
export const char = (x: string) => satisfies((y) => y == x);

/**
 * @group lexical combinator
 */
export const literal = (x: string): Parser<string> =>
  x.length && x[0]
    ? char(x[0]).bind((c) => literal(x.slice(1)).bind((cs) => unit(c + cs)))
    : unit('');

export interface CssAstNode<Type extends string, Value = any> {
  type: Type;
  value: Value;
}
export const mapResultToNode = <T extends string, Value>(
  type: T,
  value: Value,
): CssAstNode<T, Value> => ({
  type: type as T,
  value: value,
});

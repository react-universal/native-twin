import { Parser, updateResult } from '../Parser';

// sequenceOf :: [Parser * * *] -> Parser * [*] *
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
export function sequenceOf<A, B, C, D, E, F, G>([p1, p2, p3, p4, p5, p6, p7]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
]): Parser<[A, B, C, D, E, F, G]>;
export function sequenceOf<A, B, C, D, E, F, G, H>([p1, p2, p3, p4, p5, p6, p7, p8]: [
  Parser<A>,
  Parser<B>,
  Parser<C>,
  Parser<D>,
  Parser<E>,
  Parser<F>,
  Parser<G>,
  Parser<H>,
]): Parser<[A, B, C, D, E, F, G, H]>;
export function sequenceOf<A, B, C, D, E, F, G, H, I>([p1, p2, p3, p4, p5, p6, p7, p8, p9]: [
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
export function sequenceOf<A, B, C, D, E, F, G, H, I, J>([
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
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K>([
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
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L>([
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
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M>([
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
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M, N>([
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
export function sequenceOf<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>([
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
export function sequenceOf(parsers: Parser<any>[]): Parser<any[]>;
export function sequenceOf(parsers: Parser<any>[]): Parser<any[]> {
  return new Parser(function sequenceOf$state(state) {
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

// namedSequenceOf :: [(String, Parser * * *)] -> Parser e (StrMap *) s
export function namedSequenceOf(pairedParsers: Array<[string, Parser<any>]>): Parser<any[]> {
  return new Parser(function namedSequenceOf$state(state) {
    if (state.isError) return state;

    const results: Record<string, any> = {};
    let nextState = state;

    for (const [key, parser] of pairedParsers) {
      const out = parser.p(nextState);
      if (out.isError) {
        return out;
      } else {
        nextState = out;
        results[key] = out.result;
      }
    }

    return updateResult(nextState, results);
  });
}

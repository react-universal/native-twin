import { Parser } from '../Parser';
import { updateParserResult } from '../ParserState';

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

    return updateParserResult(nextState, results);
  });
}

import { Parser } from '../Parser';
import type { ParserState } from '../ParserState';

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

    return error as ParserState<any, any>;
  });
}

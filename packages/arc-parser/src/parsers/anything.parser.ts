import { Parser, updateParserError, updateParserState } from './Parser';

export const anythingExcept = (parser: Parser<any>): Parser<number> =>
  new Parser((state) => {
    if (state.isError) return state;
    const { target, cursor } = state;

    const out = parser.transform(state);

    if (out.isError) {
      return updateParserState(state, target.getUint8(cursor), cursor + 1);
    }

    return updateParserError(
      state,
      `'anythingExcept' (position ${cursor}): Matched '${out.result}' from the exception parser`,
    );
  });

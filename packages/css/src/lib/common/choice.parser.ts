import type { ParserState } from '../../types';
import { Parser } from '../Parser';

export function choice<Parsers extends Parser<any>[]>(parsers: Parsers): Parsers[number] {
  if (parsers.length === 0) throw new Error(`List of parsers can't be empty.`);
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

    return error as ParserState<any>;
  });
}

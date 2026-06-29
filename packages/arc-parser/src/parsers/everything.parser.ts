import { Parser, updateParserError, updateParserResult, updateParserState } from './Parser';

// everythingUntil :: Parser e a s -> Parser e String s
export const everythingUntil = (parser: Parser<any>): Parser<number[]> =>
  new Parser((state) => {
    if (state.isError) return state;

    const results = [];
    let nextState = state;

    while (true) {
      const out = parser.transform(nextState);

      if (out.isError) {
        const { cursor, target } = nextState;

        if (target.byteLength <= cursor) {
          return updateParserError(
            nextState,
            `'everythingUntil' (position ${nextState.cursor}): Unexpected end of input.`,
          );
        }

        const val = target.getUint8(cursor);
        if (val) {
          results.push(val);
          nextState = updateParserState(nextState, val, cursor + 1);
        }
      } else {
        break;
      }
    }

    return updateParserResult(nextState, results);
  });

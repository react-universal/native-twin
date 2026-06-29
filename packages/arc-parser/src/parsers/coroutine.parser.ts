import type { ParserState } from '../types';
import { choice } from './choice.parser';
import { Parser, updateParserResult } from './Parser';
import { char } from './string.parser';

type ParserFn<T> = (_yield: <K>(parser: Parser<K>) => K) => T;
export function coroutine<T>(parserFn: ParserFn<T>): Parser<T> {
  return new Parser((state) => {
    let currentValue;
    let currentState = state;

    const run = <T>(parser: Parser<T>) => {
      if (!(parser && parser instanceof Parser)) {
        throw new Error(`[coroutine] passed values must be Parsers, got ${parser}.`);
      }
      const newState = parser.transform(currentState);
      if (newState.isError) {
        throw newState;
      } else {
        currentState = newState;
      }
      currentValue = currentState.result;
      return currentValue;
    };

    try {
      const result = parserFn(run);
      return updateParserResult(currentState, result);
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      } else {
        return e as ParserState<any, any>;
      }
    }
  });
}

coroutine((run) => {
  const a = run(choice([char('1'), char('2'), char('[')]));
  if (a === '[') {
  }
});

import { Parser, ParserState, updateResult } from './Parser';

type ParserFn<T> = (_yield: <K>(parser: Parser<K>) => K) => T;

export function coroutine<T>(parserFn: ParserFn<T>): Parser<T> {
  return new Parser(function coroutine$state(state) {
    let currentValue;
    let currentState = state;

    const run = <T>(parser: Parser<T>) => {
      if (!(parser && parser instanceof Parser)) {
        throw new Error(`[coroutine] passed values must be Parsers, got ${parser}.`);
      }
      const newState = parser.p(currentState);
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
      return updateResult(currentState, result);
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      } else {
        return e as ParserState<any, any, any>;
      }
    }
  });
}

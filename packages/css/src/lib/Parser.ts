import {
  createParserState,
  ParserError,
  ParserState,
  ParserSuccess,
  ResultType,
  updateParserData,
  updateParserError,
  updateParserResult,
} from './ParserState';

type StateTransformerFunction<Result, ErrorResult = any, Data = any> = (
  state: ParserState<any, any, any>,
) => ParserState<Result, ErrorResult, Data>;

export class Parser<Result, ErrorResult = string, Data = any> {
  transform: StateTransformerFunction<Result, ErrorResult>;
  constructor(transform: StateTransformerFunction<Result, ErrorResult>) {
    this.transform = transform;
  }

  run(target: string): ResultType<Result, ErrorResult, Data> {
    const state = createParserState(target);

    const resultState = this.transform(state);

    if (resultState.isError) {
      return {
        isError: true,
        error: resultState.error,
        cursor: resultState.cursor,
        data: resultState.data,
      };
    }

    return {
      isError: false,
      result: resultState.result,
      cursor: resultState.cursor,
      data: resultState.data,
    };
  }

  map<Result2>(fn: (x: Result) => Result2): Parser<Result2, ErrorResult> {
    const parser = this.transform;
    return new Parser((state): ParserState<Result2, ErrorResult, Data> => {
      const newState = parser(state);
      if (newState.isError)
        return newState as unknown as ParserState<Result2, ErrorResult, Data>;
      return updateParserResult(newState, fn(newState.result));
    });
  }

  chain<Result2>(
    fn: (x: Result) => Parser<Result2, ErrorResult, Data>,
  ): Parser<Result2, ErrorResult> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2, ErrorResult, Data> => {
      const newState = p(state);
      if (newState.isError)
        return newState as unknown as ParserState<Result2, ErrorResult, Data>;
      return fn(newState.result).transform(newState);
    });
  }

  errorMap<ErrorResult2>(
    fn: (error: ParserError<ErrorResult, Data>) => ErrorResult2,
  ): Parser<Result, ErrorResult2, Data> {
    const p = this.transform;
    return new Parser((state): ParserState<Result, ErrorResult2, Data> => {
      const nextState = p(state);
      if (!nextState.isError)
        return nextState as unknown as ParserState<Result, ErrorResult2, Data>;

      return updateParserError(
        nextState,
        fn({
          isError: true,
          error: nextState.error,
          cursor: nextState.cursor,
          data: nextState.data,
        }),
      );
    });
  }

  errorChain<Result2, ErrorResult2>(
    fn: (error: ParserError<ErrorResult, Data>) => Parser<Result2, ErrorResult2, Data>,
  ): Parser<Result2, ErrorResult2, Data> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2, ErrorResult2, Data> => {
      const nextState = p(state);
      if (nextState.isError) {
        const { error, cursor, data } = nextState;
        const nextParser = fn({ isError: true, error, cursor, data });
        return nextParser.transform({ ...nextState, isError: false });
      }
      return nextState as unknown as ParserState<Result2, ErrorResult2, Data>;
    });
  }

  mapFromData<Result2>(
    fn: (data: ParserSuccess<Result, Data>) => Result2,
  ): Parser<Result2, ErrorResult, Data> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2, ErrorResult, Data> => {
      const newState = p(state);
      if (newState.isError && newState.error)
        return newState as unknown as ParserState<Result2, ErrorResult, Data>;
      return updateParserResult(
        newState,
        fn({
          isError: false,
          result: newState.result,
          data: newState.data,
          cursor: newState.cursor,
        }),
      );
    });
  }

  chainFromData<Result2, ErrorResult2>(
    fn: (data: { result: Result; data: Data }) => Parser<Result2, ErrorResult2, Data>,
  ): Parser<Result2, ErrorResult2, Data> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2, ErrorResult2, Data> => {
      const newState = p(state);
      if (newState.isError && newState.error)
        return newState as unknown as ParserState<Result2, ErrorResult2, Data>;
      return fn({ result: newState.result, data: newState.data }).transform(newState);
    });
  }

  mapData<Data2>(fn: (data: Data) => Data2): Parser<Result, ErrorResult, Data2> {
    const p = this.transform;
    return new Parser((state) => {
      const newState = p(state);
      return updateParserData(newState, fn(newState.data));
    });
  }

  static of<Result, ErrorResult = any, Data = null>(
    x: Result,
  ): Parser<Result, ErrorResult, Data> {
    return new Parser((state) => updateParserResult(state, x));
  }
}

export { between } from './common/between.parser';
export { setData, withData, getData } from './common/data.parser';
export { skip } from './common/skip.parser';
export { choice } from './common/choice.parser';
export { coroutine } from './common/coroutine.parser';
export { lookAhead } from './common/lookahead';
export { many, many1 } from './common/many.parser';
export { maybe } from './common/maybe.parser';
export { peek } from './common/peek.parser';
export { recursiveParser } from './common/recursive.parser';
export { separatedBy } from './common/separated-by.parser';
export { sequenceOf } from './common/sequence-of';

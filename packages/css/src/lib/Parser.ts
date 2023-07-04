import type { CssParserData, CssParserError } from '../types';

export class Parser<Result> {
  transform: StateTransformerFunction<Result>;
  constructor(transform: StateTransformerFunction<Result>) {
    this.transform = transform;
  }

  run(target: string, context: CssParserData): ResultType<Result> {
    const state = createParserState(target, context);

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

  map<Result2>(fn: (x: Result) => Result2): Parser<Result2> {
    const parser = this.transform;
    return new Parser((state): ParserState<Result2> => {
      const newState = parser(state);
      if (newState.isError) return newState as unknown as ParserState<Result2>;
      return updateParserResult(newState, fn(newState.result));
    });
  }

  chain<Result2>(fn: (x: Result) => Parser<Result2>): Parser<Result2> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2> => {
      const newState = p(state);
      if (newState.isError) return newState as unknown as ParserState<Result2>;
      return fn(newState.result).transform(newState);
    });
  }

  errorMap(fn: (error: ParserError) => CssParserError): Parser<Result> {
    const p = this.transform;
    return new Parser((state): ParserState<Result> => {
      const nextState = p(state);
      if (!nextState.isError) return nextState as unknown as ParserState<Result>;

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

  errorChain<Result2>(fn: (error: ParserError) => Parser<Result2>): Parser<Result2> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2> => {
      const nextState = p(state);
      if (nextState.isError) {
        const { error, cursor, data } = nextState;
        const nextParser = fn({ isError: true, error, cursor, data });
        return nextParser.transform({ ...nextState, isError: false });
      }
      return nextState as unknown as ParserState<Result2>;
    });
  }

  mapFromData<Result2>(fn: (data: ParserSuccess<Result>) => Result2): Parser<Result2> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2> => {
      const newState = p(state);
      if (newState.isError && newState.error)
        return newState as unknown as ParserState<Result2>;
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

  chainFromData<Result2>(
    fn: (data: { result: Result; data: CssParserData }) => Parser<Result2>,
  ): Parser<Result2> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2> => {
      const newState = p(state);
      if (newState.isError && newState.error)
        return newState as unknown as ParserState<Result2>;
      return fn({ result: newState.result, data: newState.data }).transform(newState);
    });
  }

  mapData(fn: (data: CssParserData) => CssParserData): Parser<Result> {
    const p = this.transform;
    return new Parser((state) => {
      const newState = p(state);
      return updateParserData(newState, fn(newState.data));
    });
  }

  static of<Result>(x: Result): Parser<Result> {
    return new Parser((state) => updateParserResult(state, x));
  }
}

export type ParserState<Result> = {
  target: string;
} & InternalResultType<Result>;

export type InternalResultType<Result> = {
  isError: boolean;
  error: CssParserError | null;
  cursor: number;
  result: Result;
  data: CssParserData;
};

export type ResultType<Result> = ParserError | ParserSuccess<Result>;

export type ParserError = {
  isError: true;
  error: CssParserError | null;
  cursor: number;
  data: CssParserData;
};

export type ParserSuccess<Result> = {
  isError: false;
  cursor: number;
  result: Result;
  data: CssParserData;
};

export const updateParserError = <Result>(
  state: ParserState<Result>,
  error: CssParserError,
): ParserState<Result> => ({ ...state, isError: true, error });

export const updateParserResult = <Result, Result2>(
  state: ParserState<Result>,
  result: Result2,
): ParserState<Result2> => ({ ...state, result });

// updateResult :: (ParserState e a s, b, Integer) -> ParserState e b s
export const updateParserState = <Result, Result2>(
  state: ParserState<Result>,
  result: Result2,
  cursor: number,
): ParserState<Result2> => ({
  ...state,
  result,
  cursor,
});

// createParserState :: x -> s -> ParserState e a s
export const createParserState = (target: string, data: CssParserData): ParserState<null> => {
  return {
    target,
    isError: false,
    error: null,
    result: null,
    cursor: 0,
    data,
  };
};

export const updateParserData = <Result>(
  state: ParserState<Result>,
  data: CssParserData,
): ParserState<Result> => ({ ...state, data });

type StateTransformerFunction<Result> = (state: ParserState<any>) => ParserState<Result>;

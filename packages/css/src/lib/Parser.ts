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

export type ParserState<Result, ErrorResult, Data> = {
  target: string;
} & InternalResultType<Result, ErrorResult, Data>;

export type InternalResultType<Result, ErrorResult, Data> = {
  isError: boolean;
  error: ErrorResult;
  cursor: number;
  result: Result;
  data: Data;
};

export type ResultType<Result, ErrorResult, Data> =
  | ParserError<ErrorResult, Data>
  | ParserSuccess<Result, Data>;

export type ParserError<ErrorResult, Data> = {
  isError: true;
  error: ErrorResult;
  cursor: number;
  data: Data;
};

export type ParserSuccess<Result, Data> = {
  isError: false;
  cursor: number;
  result: Result;
  data: Data;
};

export const updateParserError = <Result, ErrorResult, Data, ErrorResult2>(
  state: ParserState<Result, ErrorResult, Data>,
  error: ErrorResult2,
): ParserState<Result, ErrorResult2, Data> => ({ ...state, isError: true, error });

export const updateParserResult = <Result, ErrorResult, Data, Result2>(
  state: ParserState<Result, ErrorResult, Data>,
  result: Result2,
): ParserState<Result2, ErrorResult, Data> => ({ ...state, result });

// updateResult :: (ParserState e a s, b, Integer) -> ParserState e b s
export const updateParserState = <Result, ErrorResult, Data, Result2>(
  state: ParserState<Result, ErrorResult, Data>,
  result: Result2,
  cursor: number,
): ParserState<Result2, ErrorResult, Data> => ({
  ...state,
  result,
  cursor,
});

// createParserState :: x -> s -> ParserState e a s
export const createParserState = <Data>(
  target: string,
  data: Data | null = null,
): ParserState<null, string | null, Data | null> => {
  return {
    target,
    isError: false,
    error: null,
    result: null,
    cursor: 0,
    data,
  };
};

export const updateParserData = <Result, ErrorResult, Data, Data2>(
  state: ParserState<Result, ErrorResult, Data>,
  data: Data2,
): ParserState<Result, ErrorResult, Data2> => ({ ...state, data });

type StateTransformerFunction<Result, ErrorResult = any, Data = any> = (
  state: ParserState<any, any, any>,
) => ParserState<Result, ErrorResult, Data>;

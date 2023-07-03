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

export type ParserState<T, E> = {
  target: string;
} & InternalResultType<T, E>;

export type InternalResultType<T, E> = {
  isError: boolean;
  error: E;
  cursor: number;
  result: T;
};

export type ResultType<T, E> = Err<E> | Ok<T>;

export type Err<E> = {
  isError: true;
  error: E;
  cursor: number;
};

export type Ok<T> = {
  isError: false;
  cursor: number;
  result: T;
};

export const updateParserError = <T, E, E2>(
  state: ParserState<T, E>,
  error: E2,
): ParserState<T, E2> => ({ ...state, isError: true, error });

export const updateParserResult = <T, E, T2>(
  state: ParserState<T, E>,
  result: T2,
): ParserState<T2, E> => ({ ...state, result });

// updateResult :: (ParserState e a s, b, Integer) -> ParserState e b s
export const updateParserState = <T, E, T2>(
  state: ParserState<T, E>,
  result: T2,
  cursor: number,
): ParserState<T2, E> => ({
  ...state,
  result,
  cursor,
});

// createParserState :: x -> s -> ParserState e a s
export const createParserState = (target: string): ParserState<null, string | null> => {
  return {
    target,
    isError: false,
    error: null,
    result: null,
    cursor: 0,
  };
};

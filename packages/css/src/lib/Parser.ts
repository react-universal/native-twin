import type {
  CssParserData,
  CssParserError,
  ResultType,
  StateTransformerFunction,
  ParserError,
  ParserState,
  ParserSuccess,
} from '../types/types';

export class Parser<Result> {
  transform: StateTransformerFunction<Result>;
  constructor(transform: StateTransformerFunction<Result>) {
    this.transform = transform;
  }

  // run :: Parser e a s ~> X -> Either e a
  run(target: string, context: CssParserData['context']): ResultType<Result> {
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

  // map :: Parser e a s ~> (a -> b) -> Parser e b s
  map<Result2>(fn: (x: Result) => Result2): Parser<Result2> {
    const parser = this.transform;
    return new Parser((state): ParserState<Result2> => {
      const newState = parser(state);
      if (newState.isError) return newState as unknown as ParserState<Result2>;
      return updateParserResult(newState, fn(newState.result));
    });
  }

  // chain :: Parser e a s ~> (a -> Parser e b s) -> Parser e b s
  chain<Result2>(fn: (x: Result) => Parser<Result2>): Parser<Result2> {
    const p = this.transform;
    return new Parser((state): ParserState<Result2> => {
      const newState = p(state);
      if (newState.isError) return newState as unknown as ParserState<Result2>;
      return fn(newState.result).transform(newState);
    });
  }

  // errorMap :: Parser e a s ~> (e -> f) -> Parser f a s
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

  // errorChain :: Parser e a s ~> ((e, Integer, s) -> Parser f a s) -> Parser f a s
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

  // mapFromData __ Parser e a s ~> (ParserState a s -> b) -> Parser e b s
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

  // mapFromData :: Parser e a s ~> (ParserData a s -> Parser f b t) -> Parser e b t
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

  // mapData :: Parser e a s ~> (s -> t) -> Parser e a t
  mapData(fn: (data: CssParserData) => CssParserData): Parser<Result> {
    const p = this.transform;
    return new Parser((state) => {
      const newState = p(state);
      return updateParserData(newState, fn(newState.data));
    });
  }

  // fork :: Parser e a s ~> x -> (e -> ParserState e a s -> f) -> (a -> ParserState e a s -> b)
  fork<F>(
    target: string,
    errorFn: (errorMsg: CssParserError | null, parserState: ParserState<Result>) => F,
    successFn: (result: Result, parserState: ParserState<Result>) => F,
  ) {
    const state = createParserState(target, { deviceHeight: 0, deviceWidth: 0, rem: 16 });
    const newState = this.transform(state);

    if (newState.isError) return errorFn(newState.error, newState);
    return successFn(newState.result, newState);
  }

  // of :: a -> Parser e a s
  static of<Result>(x: Result): Parser<Result> {
    return new Parser((state) => updateParserResult(state, x));
  }
}

// updateParserError :: (ParserState e a s, f) -> ParserState f a s
export const updateParserError = <Result>(
  state: ParserState<Result>,
  error: CssParserError,
): ParserState<Result> => ({ ...state, isError: true, error });

// updateParserResult :: (ParserState e a s, f) -> ParserState f a s
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
export const createParserState = (
  target: string,
  context: CssParserData['context'],
): ParserState<null> => {
  return {
    target,
    isError: false,
    error: null,
    result: null,
    cursor: 0,
    data: {
      context,
      seen: {
        selectors: new Set(),
        styles: {},
      },
    },
  };
};

export const updateParserData = <Result>(
  state: ParserState<Result>,
  data: CssParserData,
): ParserState<Result> => ({ ...state, data });

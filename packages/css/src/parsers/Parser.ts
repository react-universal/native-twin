export class Parser<T, E = string, D = any> {
  p: StateTransformerFunction<T, E, D>;

  constructor(p: StateTransformerFunction<T, E, D>) {
    this.p = p;
  }

  run(target: string): ResultType<T, E, D> {
    const state = createParserState(target);

    const resultState = this.p(state);

    if (resultState.isError) {
      return {
        isError: true,
        error: resultState.error,
        index: resultState.index,
        data: resultState.data,
      };
    }

    return {
      isError: false,
      result: resultState.result,
      index: resultState.index,
      data: resultState.data,
    };
  }

  map<T2>(fn: (x: T) => T2): Parser<T2, E, D> {
    const p = this.p;
    return new Parser(function Parser$map$state(state): ParserState<T2, E, D> {
      const newState = p(state);
      if (newState.isError) return newState as unknown as ParserState<T2, E, D>;
      return updateResult(newState, fn(newState.result));
    });
  }

  chain<T2>(fn: (x: T) => Parser<T2, E, D>): Parser<T2, E, D> {
    const p = this.p;
    return new Parser(function Parser$chain$state(state): ParserState<T2, E, D> {
      const newState = p(state);
      if (newState.isError) return newState as unknown as ParserState<T2, E, D>;
      return fn(newState.result).p(newState);
    });
  }

  errorMap<E2>(fn: (error: Err<E, D>) => E2): Parser<T, E2, D> {
    const p = this.p;
    return new Parser(function Parser$errorMap$state(state): ParserState<T, E2, D> {
      const nextState = p(state);
      if (!nextState.isError) return nextState as unknown as ParserState<T, E2, D>;

      return updateError(
        nextState,
        fn({
          isError: true,
          error: nextState.error,
          index: nextState.index,
          data: nextState.data,
        }),
      );
    });
  }

  static of<T, E = any, D = null>(x: T): Parser<T, E, D> {
    return new Parser((state) => updateResult(state, x));
  }
}
const createParserState = <D>(
  target: string,
  data: D | null = null,
): ParserState<null, string | null, D | null> => {
  return {
    target,
    isError: false,
    error: null,
    result: null,
    data,
    index: 0,
  };
};

export type ParserState<T, E, D> = {
  target: string;
} & InternalResultType<T, E, D>;

export type InternalResultType<T, E, D> = {
  isError: boolean;
  error: E;
  index: number;
  result: T;
  data: D;
};

type StateTransformerFunction<T, E = any, D = any> = (
  state: ParserState<any, any, any>,
) => ParserState<T, E, D>;
export type FnReturingParserIterator<T> = () => Iterator<Parser<any>, T>;

export type ResultType<T, E, D> = Err<E, D> | Ok<T, D>;

export type Err<E, D> = {
  isError: true;
  error: E;
  index: number;
  data: D;
};

export type Ok<T, D> = {
  isError: false;
  index: number;
  result: T;
  data: D;
};

export const updateError = <T, E, D, E2>(
  state: ParserState<T, E, D>,
  error: E2,
): ParserState<T, E2, D> => ({ ...state, isError: true, error });

export const updateResult = <T, E, D, T2>(
  state: ParserState<T, E, D>,
  result: T2,
): ParserState<T2, E, D> => ({ ...state, result });

export const updateData = <T, E, D, D2>(
  state: ParserState<T, E, D>,
  data: D2,
): ParserState<T, E, D2> => ({ ...state, data });

export const updateParserState = <T, E, D, T2>(
  state: ParserState<T, E, D>,
  result: T2,
  index: number,
): ParserState<T2, E, D> => ({
  ...state,
  result,
  index,
});

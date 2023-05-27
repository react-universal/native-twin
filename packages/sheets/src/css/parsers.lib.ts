export interface ParserState {
  index: number;
  targetString: string;
  result: string;
  isError: boolean;
  error: string | null;
}

export type ParserFn<T> = (state: ParserState) => T;

export const applyParser = <T>(parser: ParserFn<T>) => {
  return (state: ParserState) => {
    return parser(state);
  };
};

const isNumber = (input: string) => {
  const _0 = '0'.charCodeAt(0);
  const _9 = '9'.charCodeAt(0);
  const _dot = '.'.charCodeAt(0);
  return (
    (input.charCodeAt(0) >= _0 && input.charCodeAt(0) <= _9) || input.charCodeAt(0) == _dot
  );
};

/* HELPERS TO HANDLE PARSER STATE MUTATIONS */
const helpers = {
  updateParserResult(state: ParserState, result: any): ParserState {
    return {
      ...state,
      result,
    };
  },
  updateParserError(state: ParserState, errorMsg: string): ParserState {
    return {
      ...state,
      error: errorMsg,
      isError: true,
    };
  },
  updateParserState(
    state: ParserState,
    index: number,
    result: ParserState['result'],
  ): ParserState {
    return {
      ...state,
      index,
      result,
    };
  },
};

export const combineParsers = <T>(...args: ParserFn<T>[]) => {
  return (state: ParserState) => {
    const result: T[] = [];
    let nextState = state;
    for (const parser of args) {
      nextState = applyParser(parser)(nextState) as any as ParserState;
      result.push(nextState as T);
    }
    return result;
  };
};

export const matchSelectorParser = applyParser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return helpers.updateParserError(parserState, `Selectors: Got unexpected end of input`);
  }

  if (slicedTarget.charAt(0) === '.') {
    const endOfSelector = slicedTarget.indexOf('{');
    const selector = slicedTarget.slice(0, endOfSelector);
    return helpers.updateParserState(parserState, index + endOfSelector, selector);
  }

  return helpers.updateParserError(
    parserState,
    `Selectors: Couldn't match selector at index ${index}`,
  );
});

export const matchDeclarationsParser = applyParser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return helpers.updateParserError(parserState, `Declarations: Got unexpected end of input`);
  }

  if (slicedTarget.charAt(0) === '{') {
    const endOfDeclarations = slicedTarget.indexOf('}') + 1;
    const ruleDeclarations = slicedTarget.slice(0, endOfDeclarations);
    return helpers.updateParserState(parserState, index + endOfDeclarations, ruleDeclarations);
  }

  return helpers.updateParserError(
    parserState,
    `Declarations: Couldn't match declaration at index ${index}`,
  );
});

export const matchCssParser = combineParsers(matchSelectorParser, matchSelectorParser);

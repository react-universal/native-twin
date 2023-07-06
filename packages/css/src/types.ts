import type { AnyStyle, SelectorGroup } from './css.types';

export interface CssParserData {
  context: {
    rem: number;
    deviceWidth: number;
    deviceHeight: number;
  };
  seen: {
    selectors: Set<string>;
    styles: AnyStyle;
  };
}

export interface CssParserError {
  position: number;
  message: string;
}

export type CssParserCache = Map<
  string,
  {
    group: SelectorGroup;
    styles: Record<string, any>;
  }
>;

export type StateTransformerFunction<Result> = (
  state: ParserState<any>,
) => ParserState<Result>;

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

import type { Platform } from 'react-native';
import type { SelectorGroup } from './css.types';
import type { AnyStyle, FinalSheet } from './rn.types';

export interface CssParserData {
  context: {
    rem: number;
    deviceWidth: number;
    deviceHeight: number;
    platform: Platform['OS'];
    colorScheme: 'dark' | 'light';
    debug: boolean;
  };
  styles: FinalSheet;
  cache: {
    get: (selector: string) => AnyStyle | null;
    set: (selector: string, style: AnyStyle) => void;
  };
}

export interface CssParserError {
  position: number;
  message: string;
}

export type CssParserCache = Map<string, CssNode>;

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

export type CssNode = {
  selector: {
    group: SelectorGroup;
    value: string;
  };
  declarations: AnyStyle;
};

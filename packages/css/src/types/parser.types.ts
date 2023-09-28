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

export type CssParserCache = Map<string, CssNode>;

export type StateTransformerFunction<Result, Data = any> = (
  state: ParserState<any, any>,
) => ParserState<Result, Data>;

export type ParserState<Result, Data> = {
  target: string;
} & InternalResultType<Result, Data>;

export type InternalResultType<Result, Data> = {
  isError: boolean;
  error: string | null;
  cursor: number;
  result: Result;
  data: Data;
};

export type ResultType<Result, Data> = ParserSuccess<Result, Data> | ParserError<Data>;

export type ParserError<Data> = {
  isError: true;
  error: string | null;
  cursor: number;
  data: Data;
};

export type ParserSuccess<Result, Data> = {
  isError: false;
  cursor: number;
  result: Result;
  data: Data;
};

export type CssNode = {
  selector: {
    group: SelectorGroup;
    value: string;
  };
  declarations: AnyStyle;
};

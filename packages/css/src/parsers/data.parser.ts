import type { CssParserData, ParserState } from '../types/parser.types';
import { Parser, updateParserData, updateParserResult } from './Parser';

export const getData = new Parser((state): ParserState<CssParserData, any> => {
  if (state.isError) return state;
  return updateParserResult(state, state.data);
});

export const setData = <Result, Data>(data: Data): Parser<Result, Data> =>
  new Parser((state) => {
    if (state.isError) return state;
    return updateParserData<Result, Data>(state, data);
  });

export const withData =
  <Result, Data>(parser: Parser<Result, Data>): ((data: Data) => Parser<Result>) =>
  (stateData) =>
    setData<Result, Data>(stateData).chain(() => parser);

import type { CssParserData, ParserState } from '../../types/parser.types';
import { Parser, updateParserData, updateParserResult } from '../Parser';

export const getData = new Parser((state): ParserState<CssParserData> => {
  if (state.isError) return state;
  return updateParserResult(state, state.data);
});

export const setData = <Result>(data: CssParserData): Parser<Result> =>
  new Parser((state) => {
    if (state.isError) return state;
    return updateParserData<Result>(state, data);
  });

export const withData =
  <Result>(parser: Parser<Result>): ((data: CssParserData) => Parser<Result>) =>
  (stateData) =>
    setData<Result>(stateData).chain(() => parser);

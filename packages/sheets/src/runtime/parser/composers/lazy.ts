import { Parser } from '../Parser';

export const lazyParserMatch = (parserThunk: () => Parser) => {
  return new Parser((parserState) => {
    const parser = parserThunk();
    return parser.parserStateTransformerFn(parserState);
  });
};

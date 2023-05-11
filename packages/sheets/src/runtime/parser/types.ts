export type ParserFn = (parserState: ParserState) => ParserState;

export interface ParserState {
  index: number;
  targetString: string;
  result: string | null;
  isError: boolean;
  error: string | null;
}

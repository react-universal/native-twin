export type ParserFn = (parserState: ParserState) => ParserState;

export interface ParserState {
  index: number;
  targetString: string;
  result: string | any;
  isError: boolean;
  error: string | null;
}

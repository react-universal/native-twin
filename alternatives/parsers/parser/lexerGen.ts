import { Parser } from './Parser';
import { matchCssComment } from './combinator/comments';
import { matchCssDeclarations } from './combinator/declarations';
import { matchCssSelector } from './combinator/selector';
import type { ParserState } from './types';

enum TokenType {
  Comment,
  Selector,
  Declaration,
  InvalidToken,
  EOF,
}

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(source: string): Token[] {
  const tokens = new Array<Token>();
  let parserState: ParserState = {
    error: null,
    isError: false,
    index: 0,
    result: '',
    targetString: source,
  };

  const matchComment = (): Token | null => {
    parserState = matchCssComment.run(parserState.targetString.slice(parserState.index));
    if (parserState.isError) {
      return null;
    }
    return {
      type: TokenType.Comment,
      value: parserState.result,
    };
  };

  const matchSelector = (): Token | null => {
    parserState = matchCssSelector.run(parserState.targetString.slice(parserState.index));
    if (parserState.isError) {
      return null;
    }
    return {
      type: TokenType.Selector,
      value: parserState.result,
    };
  };

  const matchDeclarations = (): Token | null => {
    parserState = matchCssDeclarations.run(parserState.targetString.slice(parserState.index));
    if (parserState.isError) {
      return null;
    }
    return {
      type: TokenType.Declaration,
      value: parserState.result,
    };
  };

  const token = matchComment() || matchSelector() || matchDeclarations();
  if (!token) {
    console.log('Invalid token', parserState);
    return tokens;
  }
  if (token.type === TokenType.InvalidToken) {
    console.log('Invalid token', token);
  }
  tokens.push(token);

  return tokens;
}

const result = tokenize(
  '/*!dbgidc,t,text-gray-800*/.text-gray-800{--tw-text-opacity:1;color:rgba(31,41,55,var(--tw-text-opacity))}/*!dbgidc,w,text-xl*/.text-xl{font-size:1.25rem;line-height:1.75rem}/*!dbgidc,y,leading-6*/.leading-6{line-height:1.5rem}/*!dbjbi8,t,group-hover:text-white*/.group:hover .group-hover\\:text-white{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))}',
);

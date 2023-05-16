import { matchLetters } from './combinator/letters';
import type { ParserState } from './types';

class Token<TokenType extends string, TokenValue extends unknown> {
  type: TokenType;
  value: TokenValue;
  constructor(type: TokenType, value: TokenValue) {
    this.value = value;
    this.type = type;
  }
}

function* lexer(input: string): Generator<Token<any, any>, any, any> {
  let currentState: ParserState = {
    error: null,
    isError: false,
    index: 0,
    result: '',
    targetString: '',
  };
  let cursor = 0;
  let currentChar = input[cursor];
  let result: Token<any, any>[] = [];
  let predecesor: null | Token<any, any> = null;

  // Advance the cursor and set the current character
  function next() {
    cursor++;
    currentChar = input[cursor];
  }

  const comment = () => {
    if (input[cursor] === '/' && input[cursor + 1] === '*' && currentChar) {
      let comment = '';
      while (input.slice(cursor) !== '/') {
        comment += currentChar;
        next();
        if (currentChar === '*' && input[cursor + 1] === '/') {
          next();
          break;
        }
      }
      return new Token('comment', comment);
    }
    return null;
  };

  const selector = () => {
    if (currentChar === '.' && currentChar) {
      let selector = '';
      while (input.slice(cursor) !== '{') {
        selector += currentChar;
        next();
      }
      return new Token('selector', selector);
    }
    next();
    return null;
  };

  while (cursor < input.length) {
    const token = comment() || selector();
    if (currentChar === undefined) {
      yield { type: 'eof', value: '' };
    } else if (token) {
      yield token;
      next();
    } else {
      throw new SyntaxError(`Unexpected character: ${currentChar} at index ${cursor}`);
    }
  }
}

const result = lexer(
  '/*!dbgidc,t,text-gray-800*/.text-gray-800{--tw-text-opacity:1;color:rgba(31,41,55,var(--tw-text-opacity))}/*!dbgidc,w,text-xl*/.text-xl{font-size:1.25rem;line-height:1.75rem}/*!dbgidc,y,leading-6*/.leading-6{line-height:1.5rem}/*!dbjbi8,t,group-hover:text-white*/.group:hover .group-hover\\:text-white{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))}',
);
for (const token of result) {
  console.log(token);
}

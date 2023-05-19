// import { Dimensions } from 'react-native';
import { tokenizeDeclarations } from './declarations';

interface CssLexerState {
  cursor: number;
  targetString: string;
  isError: boolean;
  error: string | null;
}

interface LexerConstructor {
  (input: string, result?: [Selector: string, Declarations: any][]): any;
  currentState: CssLexerState;
}

function removeComments(css: string): string {
  return css.replace(/\/\*[^]*?\*\/|\s\s+|\n/gm, '');
}

export const CssLexer: LexerConstructor = (
  css: string,
  result: [Selector: string, Declarations: any][] = [],
) => {
  let currentState: CssLexerState = {
    cursor: 0,
    targetString: removeComments(css),
    isError: false,
    error: null,
  };
  const isSelector = currentState.targetString[currentState.cursor] === '.';
  if (isSelector) {
    const endOfSelector = currentState.targetString.indexOf('{');
    const selector = currentState.targetString.slice(currentState.cursor, endOfSelector);

    currentState.cursor = endOfSelector;
    const nextChar = currentState.targetString[currentState.cursor];
    if (nextChar === '{') {
      currentState.cursor += 1;
      const endOfDeclarations = currentState.targetString.indexOf('}');
      const declarations = currentState.targetString.slice(
        currentState.cursor,
        endOfDeclarations,
      );
      currentState.cursor = endOfDeclarations + 1;
      result.push([selector, tokenizeDeclarations(declarations)]);
      if (currentState.cursor < currentState.targetString.length) {
        return CssLexer(currentState.targetString.slice(currentState.cursor), result);
      }
    }
  }
  return result;
};

CssLexer.currentState = {
  cursor: 0,
  targetString: '',
  isError: false,
  error: null,
};

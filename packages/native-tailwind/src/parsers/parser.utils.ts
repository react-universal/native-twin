import { createParserContext } from '@universal-labs/css/parser';

export interface ClassNameToken {
  readonly type: 'CLASS_NAME';
  readonly variant: boolean;
  readonly important: boolean;
  readonly name: string;
}

export interface ClassGroupToken {
  readonly type: 'GROUP';
  readonly variant: boolean;
  readonly important: boolean;
  readonly name: string;
  readonly list: (ClassNameToken | ClassGroupToken)[];
}

export type RuleToken = ClassNameToken | ClassGroupToken;

export function parseClassNameTokens(...tokens: ClassNameToken[]): string {
  let allImportant = false;
  return tokens.reduce((prev, current, currentIndex) => {
    if (prev == '') prev += '.';
    prev += current.name;
    if (current.variant) {
      prev += prev.endsWith(':') ? '' : ':';
      if (current.important) allImportant = true;
    }
    if (currentIndex == tokens.length - 1) return prev;
    if (current.important || (!current.variant && allImportant)) prev += '!';
    return prev;
  }, ``);
}

export const defaultParserContext = createParserContext({
  cache: {
    get: () => null,
    set: () => {},
  },
  context: {
    colorScheme: 'light',
    debug: false,
    deviceHeight: 1820,
    deviceWidth: 720,
    platform: 'ios',
    rem: 16,
  },
});

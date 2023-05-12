import camelize from 'fbjs/lib/camelize';
import { Parser } from './Parser';
import { fullRuleMatch } from './combinator/css';
import { matchLetters } from './combinator/letters';
import { matchDigits } from './combinator/numbers';
import { matchString } from './combinator/string';
import { matchMany, matchStrictMany } from './composers/many';
import { matchChoice, matchSequenceOf } from './composers/sequence';
import { updateParserResult } from './helpers';
import type { ParserState } from './types';

interface DeclarationNode {
  property: string;
  value: string;
}
export class CssTokenizer {
  #rule: string;
  ast: ParserState = {
    error: null,
    isError: false,
    index: 0,
    result: '',
    targetString: '',
  };

  constructor(rule: string) {
    this.#rule = rule;
    this.interpreter();
  }

  evaluate(node: any): any {
    if (node.type === 'stylesheet') {
      return this.evaluate(node.value.declarations);
    }
    if (node.type === 'comment') {
      return node.value;
    }
    if (node.type === 'selector') {
      return node.value;
    }
    if (node.type === 'declarations') {
      const splittedDeclarationsParser = matchMany(
        matchSequenceOf([
          matchMany(
            matchChoice([
              matchLetters,
              matchDigits,
              matchString('-'),
              matchString('('),
              matchString(')'),
            ]),
          ).map((result: any) => result.join('')),
          matchString(':'),
          matchMany(
            matchChoice([
              matchLetters,
              matchDigits,
              matchString('-'),
              matchString('('),
              matchString(')'),
              matchString(','),
              matchString('.'),
              matchString('*'),
              matchString(' '),
              matchString('['),
              matchString(']'),
            ]),
          ).map((result: any) => result.join('')),
          matchString(';'),
        ]).map((result: any) => {
          return {
            property: result[0],
            value: result[2],
          };
        }),
      ).chain((result: DeclarationNode[]) => {
        return new Parser((state) => {
          const validDeclarations: DeclarationNode[] = [];
          const variables: Record<string, string> = {};
          for (const declaration of result) {
            if (declaration.property.startsWith('--')) {
              variables[declaration.property] = declaration.value;
            } else {
              const newValue = declaration.value.replace(/var\((--[\w-]+)\)/g, (match, p1) =>
                p1 in variables ? variables[p1]! : match,
              );
              const newProperty = camelize(declaration.property);
              validDeclarations.push({
                property: newProperty,
                value: newValue,
              });
            }
          }
          return updateParserResult(state, validDeclarations);
        });
      });
      const result = splittedDeclarationsParser.run(node.value);
      console.log('TEST: ', result);
      return result.result;
    }
  }

  interpreter() {
    const parser = fullRuleMatch;
    this.ast = parser.run(this.#rule);
    return this.evaluate(this.ast.result);
  }
}

const commentsParser = matchSequenceOf([
  matchString('/*!'),
  matchMany(
    matchChoice([
      matchLetters,
      matchDigits,
      matchString(','),
      matchString('-'),
      matchString(':'),
      matchString('['),
      matchString(']'),
    ]),
  ),
  matchString('*/'),
])
  .map((result) => {
    return {
      value: result![1],
      type: 'comment',
    };
  })
  .map((result: any) => {
    return {
      value: result.value.join(''),
      type: 'comment',
    };
  });

const selectorParser = matchSequenceOf([
  matchChoice([matchString('.'), matchString('#'), matchString('@')]),
  matchMany(
    matchChoice([
      matchLetters,
      matchDigits,
      matchString(','),
      matchString('.'),
      matchString('-'),
      matchString(':'),
      matchString('['),
      matchString(']'),
      matchString('('),
      matchString(')'),
      matchString('&'),
      matchString('\\'),
      matchString(' '),
    ]),
  ),
  matchString('{'),
])
  .map((result) => {
    return {
      value: result![1],
      type: 'selector',
    };
  })
  .map((result: any) => {
    return {
      value: result.value.join(''),
      type: 'selector',
    };
  });

const declarationParser = matchSequenceOf([
  matchMany(
    matchChoice([
      matchLetters,
      matchDigits,
      matchString(','),
      matchString(';'),
      matchString(':'),
      matchString('('),
      matchString(')'),
      matchString('['),
      matchString(']'),
      matchString('.'),
      matchString(' '),
      matchString('-'),
      matchString('*'),
      matchString('+'),
      matchString('%'),
      matchString('\\'),
    ]),
  ),
  matchString('}'),
])
  .map((result) => {
    return {
      value: result![0],
      type: 'declarations',
    };
  })
  .map((result: any) => {
    return {
      value: result.value.join(''),
      type: 'declarations',
    };
  });

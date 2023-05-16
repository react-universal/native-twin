import camelize from 'fbjs/lib/camelize';
import { Parser } from './Parser';
import { fullRuleMatch } from './combinator/css';
import { matchLetters } from './combinator/letters';
import { matchDigits } from './combinator/numbers';
import { matchString } from './combinator/string';
import { matchMany } from './composers/many';
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
  }

  evaluate(node: any): any {
    if (node.type === 'stylesheet') {
      return this.evaluate(node.value);
    }
    if (node.type === 'rules') {
      const results = [];
      for (const rule of node.value) {
        results.push(this.evaluate(rule.value.declarations));
      }
      return results;
    }
    if (node.type === 'comment') {
      return node.value;
    }
    if (node.type === 'selector') {
      return node.value;
    }
    if (node.type === 'declarations') {
      const result = matchDeclarations.run(node.value);
      return result.result;
    }
  }

  interpreter() {
    const parser = fullRuleMatch;
    this.ast = parser.run(this.#rule);
    return this.ast;
  }
}

const matchDeclarations = matchMany(
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
        matchString('%'),
      ]),
    ).map((result: any) => result.join('')),
    matchMany(matchChoice([matchString(';'), matchString('}')])),
  ]).map((result: any) => {
    return {
      property: result[0],
      value: result[2],
    };
  }),
).chain((result: DeclarationNode[]) => {
  return parseDeclarationsToStyleAST(result);
});

const parseDeclarationsToStyleAST = (result: DeclarationNode[]) => {
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
        const newProperty = getStylePropertyName(declaration.property);
        const value = getStylePropertyValue(newValue);
        validDeclarations.push({
          property: newProperty,
          value,
        });
      }
    }
    return updateParserResult(state, validDeclarations);
  });
};

const getStylePropertyName = (property: string) => {
  return camelize(property);
};

const getStylePropertyValue = (value: string) => {
  console.log('VALUE: ', value);
  const nextState = matchDeclarationValue.run(value);
  if (nextState.result?.type === 'unit') {
    console.log('UNIT: ', nextState);
  }
  return value;
};

const matchColor = matchChoice([
  matchString('#'),
  matchString('rgb'),
  matchString('rgba'),
  matchString('hsl'),
  matchString('hsla'),
]).map((result: any) => ({
  type: 'color',
  value: result,
}));

const matchUnit = matchSequenceOf([
  matchMany(matchChoice([matchDigits, matchString('.')])),
  matchChoice([
    matchString('px'),
    matchString('em'),
    matchString('rem'),
    matchString('vh'),
    matchString('vw'),
    matchString('vmin'),
    matchString('vmax'),
    matchString('cm'),
    matchString('mm'),
    matchString('in'),
    matchString('pt'),
    matchString('pc'),
    matchString('ex'),
    matchString('ch'),
    matchString('fr'),
    matchString('deg'),
    matchString('rad'),
    matchString('turn'),
    matchString('s'),
    matchString('ms'),
    matchString('Hz'),
    matchString('kHz'),
    matchString('%'),
  ]),
]).map((result: any) => ({
  type: 'unit',
  value: result,
}));

const matchDeclarationValue = matchChoice([matchColor, matchUnit]).map(
  (result: any) => result,
);

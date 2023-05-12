import { describe, expect, it } from 'vitest';
import { matchLetters } from '../src/runtime/parser/combinator/letters';
import { matchDigits } from '../src/runtime/parser/combinator/numbers';
import { matchString } from '../src/runtime/parser/combinator/string';
import { lazyParserMatch } from '../src/runtime/parser/composers/lazy';
import { matchMany } from '../src/runtime/parser/composers/many';
import { matchBetween, matchSeparatedBy } from '../src/runtime/parser/composers/separated';
import { matchChoice, matchSequenceOf } from '../src/runtime/parser/composers/sequence';

describe('@universal-labs/stylesheets', () => {
  it('Parse Letters', () => {
    const parser = matchLetters;

    expect(parser.run('testletters234')).toStrictEqual({
      error: null,
      index: 11,
      isError: false,
      result: 'testletters',
      targetString: 'testletters234',
    });
  });

  it('Parse Digits', () => {
    const parser = matchDigits;

    expect(parser.run('456testletters234')).toStrictEqual({
      error: null,
      index: 3,
      isError: false,
      result: '456',
      targetString: '456testletters234',
    });
  });

  it('Parse Sequence of letters and digits combined', () => {
    const parser = matchSequenceOf([matchDigits, matchLetters, matchDigits]);

    expect(parser.run('456testletters234')).toStrictEqual({
      error: null,
      index: 17,
      isError: false,
      result: ['456', 'testletters', '234'],
      targetString: '456testletters234',
    });
  });

  it('Parse Sequence Of', () => {
    const parser = matchSequenceOf([
      matchString('Hello There!'),
      matchString('Goodbye there!'),
    ]);

    expect(parser.run('Hello There!Goodbye there!')).toStrictEqual({
      error: null,
      index: 26,
      isError: false,
      result: ['Hello There!', 'Goodbye there!'],
      targetString: 'Hello There!Goodbye there!',
    });
  });

  it('Parse Choice', () => {
    const parser = matchChoice([matchString('Hello There!'), matchString('Goodbye there!')]);

    expect(parser.run('Hello There!Goodbye there!')).toStrictEqual({
      error: null,
      index: 12,
      isError: false,
      result: 'Hello There!',
      targetString: 'Hello There!Goodbye there!',
    });
  });

  it('Parse Many', () => {
    const parserMany = matchMany(matchChoice([matchLetters, matchDigits]));

    expect(parserMany.run('456asd')).toStrictEqual({
      error: null,
      index: 6,
      isError: false,
      result: ['456', 'asd'],
      targetString: '456asd',
    });
  });

  it('Parse Separated by', () => {
    const betweenSquareBrackets = matchBetween(matchString('['), matchString(']'));
    const commaSeparated = matchSeparatedBy(matchString(','));
    const parser = betweenSquareBrackets(commaSeparated(matchDigits));

    expect(parser.run('[1,2,3,4,5]')).toStrictEqual({
      error: null,
      index: 11,
      isError: false,
      result: ['1', '2', '3', '4', '5'],
      targetString: '[1,2,3,4,5]',
    });
  });

  it('Lazy Parse Separated by', () => {
    const betweenSquareBrackets = matchBetween(matchString('['), matchString(']'));
    const commaSeparated = matchSeparatedBy(matchString(','));
    const value = lazyParserMatch(() => matchChoice([matchDigits, parser]));
    const parser = betweenSquareBrackets(commaSeparated(value));
    const result = parser.run('[1,[2,[3,4]],5]');

    expect(result).toStrictEqual({
      error: null,
      index: 15,
      isError: false,
      result: ['1', ['2', ['3', '4']], '5'],
      targetString: '[1,[2,[3,4]],5]',
    });
  });

  it('Parse pseudolang', () => {
    /*
      Add:      (+ 10 2)
      Subtract: (- 10 2)
      Multiply: (* 10 2)
      Divide:   (/ 10 2)

      Nest calculations: (+ (* 10 2) (- (/ 50 3) 2))
    */
    const betweenParens = matchBetween(matchString('('), matchString(')'));
    const numberParser = matchDigits.map((x) => {
      return { type: 'number', value: Number(x) };
    });
    const operatorParser = matchChoice([
      matchString('+'),
      matchString('-'),
      matchString('*'),
      matchString('/'),
    ]);
    const expression = lazyParserMatch(() => matchChoice([numberParser, operationParser]));
    const operationParser = betweenParens(
      matchSequenceOf([
        operatorParser,
        matchString(' '),
        expression,
        matchString(' '),
        expression,
      ]),
    ).map((x) => {
      return {
        type: 'operation',
        value: {
          operator: x![0],
          left: x![2],
          right: x![4],
        },
      };
    });

    const evaluate = (node: any): any => {
      if (node.type === 'number') {
        return node.value;
      }
      if (node.type === 'operation') {
        if (node.value.operator === '+') {
          return evaluate(node.value.left) + evaluate(node.value.right);
        }
        if (node.value.operator === '-') {
          return evaluate(node.value.left) - evaluate(node.value.right);
        }
        if (node.value.operator === '*') {
          return evaluate(node.value.left) * evaluate(node.value.right);
        }
        if (node.value.operator === '/') {
          return evaluate(node.value.left) / evaluate(node.value.right);
        }
      }
    };

    const interpreter = (program: string) => {
      const parseResult = expression.run(program);
      if (parseResult.isError) {
        throw new Error('Parse error');
      }

      return evaluate(parseResult.result);
    };

    const program = '(+ (* 10 2) (- (/ 50 3) 2))';
    const nodeCalc = 10 * 2 + (50 / 3 - 2);

    expect(interpreter(program)).toBe(nodeCalc);
  });
});

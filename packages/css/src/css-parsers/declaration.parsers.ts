import { parser, string, number, composed } from '../lib';
import type { AstDeclarationNode, AstRawValueNode } from '../types';
import { CssCalcParser, CssUnitDimensionsParser } from './dimensions.parser';
import { CssColorParser } from './styles/color.parser';
import { FlexToken } from './styles/flex.parser';
import { ShadowValueToken } from './styles/shadow.parser';
import { TranslateValueToken } from './styles/translate.parser';

const PropertyValidChars = parser
  .many1(parser.choice([number.alphanumeric, string.char('-')]))
  .map((x) => x.join(''));

const DeclarationPropertyToken = parser
  .sequenceOf([PropertyValidChars, string.char(':')])
  .map((x) => x[0]);

const DeclarationRawValueToken = parser
  .many1(parser.choice([string.letters, string.char('-')]))
  .map((x): AstRawValueNode => {
    return {
      type: 'RAW',
      value: x.join(''),
    };
  });

export const ParseDeclarationToken = parser.coroutine((run): AstDeclarationNode => {
  const property = run(DeclarationPropertyToken);

  let value: AstDeclarationNode['value'] | null = null;

  if (property === 'box-shadow') {
    value = run(ShadowValueToken);
  }

  if (property === 'flex') {
    value = run(FlexToken);
  }

  if (property === 'transform') {
    value = run(TranslateValueToken);
  }

  if (value === null) {
    value = run(
      parser.choice([
        CssCalcParser,
        CssColorParser,
        CssUnitDimensionsParser,
        DeclarationRawValueToken,
      ]),
    );
  }

  run(parser.maybe(string.char(';')));

  return {
    type: 'DECLARATION',
    property,
    value,
  };
});

export const DeclarationTokens = composed.betweenBrackets(parser.many1(ParseDeclarationToken));

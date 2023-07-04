import { evaluateDimensionsNode } from '../evaluators/dimensions.evaluator';
import { kebab2camel } from '../helpers';
import { parser, string } from '../lib';
import type { AnyStyle, AstDeclarationNode, CssParserData } from '../types';
import { DeclarationRawValueToken, ParseDeclarationProperty } from './declaration.parsers';
import { CssDimensionsParser } from './dimensions.parser';
import { CssColorParser } from './styles/color.parser';
import { FlexToken } from './styles/flex.parser';
import { ShadowValueToken } from './styles/shadow.parser';
import { TranslateValueToken } from './styles/translate.parser';

export const ParseCssRuleBlock = parser.coroutine((run) => {
  const context: CssParserData = run(parser.getData);
  run(string.char('{'));

  const declaration = parseDeclarations();
  run(string.char('}'));

  return declaration;

  function getNextProperty() {
    return run(ParseDeclarationProperty);
  }

  function parseDeclarations(result: AnyStyle = {}): AnyStyle {
    const isValid = run(parser.peek) !== '}';
    // console.log('IS_VALID: ', isValid);
    if (!isValid) return result;

    const property = getNextProperty();
    // console.log('DECLARATION-PROP: ', property);
    let value: AstDeclarationNode['value'] | null | any = null;

    if (property.type === 'RAW') {
      value = run(DeclarationRawValueToken);
      // console.log('RAW: ', value);
      Object.assign(result, {
        [kebab2camel(property.value)]: value,
      });
    }

    if (property.type === 'DIMENSIONS-PROP') {
      value = run(CssDimensionsParser.map((x) => evaluateDimensionsNode(x, context)));
      // console.log('DIMENSIONS-VALUE: ', value);
      Object.assign(result, {
        [kebab2camel(property.value)]: value,
      });
    }

    if (property.type === 'FLEX-PROP') {
      value = run(FlexToken);
      Object.assign(result, value);
    }
    if (property.type === 'SHADOW-PROP') {
      value = run(ShadowValueToken);
      Object.assign(result, value);
    }

    if (property.type === 'COLOR-PROP') {
      value = run(CssColorParser);
      Object.assign(result, {
        [kebab2camel(property.value)]: value,
      });
    }

    if (property.type === 'TRANSFORM-PROP') {
      value = run(TranslateValueToken);
      // console.log('TRANSFORM-VALUE: ', value);
      Object.assign(result, {
        [property.value]: value,
      });
    }

    const nextChar = run(parser.maybe(string.char(';')));
    if (nextChar) {
      return parseDeclarations(result);
    }
    return result;
  }
});

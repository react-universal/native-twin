import { evaluateDimensionsNode } from '../evaluators/dimensions.evaluator';
import { kebab2camel } from '../helpers';
import { parser, string } from '../lib';
import type { AnyStyle, AstDeclarationNode, CssParserData } from '../types';
import { ParseDeclarationProperty } from './declaration.parsers';
import { CssDimensionsParser } from './dimensions.parser';
import { FlexToken } from './styles/flex.parser';
import { ShadowValueToken } from './styles/shadow.parser';

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
    const property = getNextProperty();
    let value: AstDeclarationNode['value'] | null | any = null;

    if (property.type === 'DIMENSIONS-PROP') {
      value = run(CssDimensionsParser.map((x) => evaluateDimensionsNode(x, context)));
      result = {
        ...result,
        [kebab2camel(property.value)]: value,
      };
    }

    if (property.type === 'FLEX-PROP') {
      value = run(FlexToken);
      result = {
        ...result,
        ...value,
      };
    }
    if (property.type === 'SHADOW-PROP') {
      value = run(ShadowValueToken);
      result = {
        ...result,
        ...value,
      };
    }

    const nextChar = run(parser.maybe(string.char(';')));
    if (nextChar) {
      return parseDeclarations(result);
    }
    return result;
  }
});

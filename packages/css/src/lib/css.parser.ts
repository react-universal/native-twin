import type { FlexStyle, ShadowStyleIOS } from 'react-native';
import { evaluateMediaQueryConstrains } from '../evaluators/at-rule.evaluator';
import { evaluateDimensionsNode } from '../evaluators/dimensions.evaluator';
import { kebab2camel, resolveCssCalc } from '../helpers';
import type { AnyStyle } from '../types';
import { between } from './common/between.parser';
import { choice } from './common/choice.parser';
import {
  parseDeclarationProperty,
  betweenBrackets,
  betweenParens,
  parseDeclarationUnit,
  parseMathOperatorSymbol,
  separatedBySpace,
} from './common/composed.parsers';
import { coroutine } from './common/coroutine.parser';
import { getData } from './common/data.parser';
import { many, many1 } from './common/many.parser';
import { maybe } from './common/maybe.parser';
import { float } from './common/number.parser';
import { peek } from './common/peek.parser';
import { recursiveParser } from './common/recursive.parser';
import { sequenceOf } from './common/sequence-of';
import { char, everyCharUntil, ident, literal, whitespace } from './common/string.parser';
import { getPropertyValueType, mapSelector } from './utils.parser';

/*
 ************ SELECTORS ***********
 */
// subsequent-sibling combinator
// '~' === '\u{007E}'; -> true
const ParseCssSelector = sequenceOf([char('.'), everyCharUntil('{')])
  .map((x) => x[0] + x[1])
  .map(mapSelector);

/*
 ************ DECLARATION VALUES ***********
 */

const ParseCssColor = sequenceOf([
  choice([literal('rgba'), literal('hsl'), literal('#')]),
  betweenParens(many1(choice([ident, char('.'), char(',')])).map((x) => x.join(''))),
]).map((x) => {
  return `${x[0]}(${x[1]})`;
});

const ParseCssDimensions = recursiveParser(() =>
  choice([ParseDimensionWithUnits, ParseCssCalc]),
);
// 1.2rem calc(1.2rem *)
const ParseDimensionWithUnits = sequenceOf([float, maybe(parseDeclarationUnit)]).mapFromData(
  (x) =>
    evaluateDimensionsNode(
      {
        type: 'DIMENSIONS',
        units: x.result[1] ?? 'none',
        value: parseFloat(x.result[0]),
      },
      x.data,
    ),
);

const ParseCssCalc = sequenceOf([
  literal('calc'),
  char('('),
  ParseDimensionWithUnits,
  between(whitespace)(whitespace)(parseMathOperatorSymbol),
  ParseDimensionWithUnits,
  char(')'),
]).mapFromData((x) => {
  return resolveCssCalc(x.result[2], x.result[3], x.result[4]);
});

const ParseFlexValue = separatedBySpace(ParseCssDimensions).mapFromData((x): FlexStyle => {
  return x.result.reduce(
    (prev, current, index) => {
      if (index === 0) {
        prev.flexShrink = current;
      }
      if (index === 1) {
        prev.flexShrink = current;
      }
      if (index === 2) {
        prev.flexBasis = current;
      }
      return prev;
    },
    {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '0%',
    } as FlexStyle,
  );
});

const DimensionNextSpace = sequenceOf([ParseCssDimensions, whitespace]).map((x) => x[0]);

const ParseShadowValue = many(
  sequenceOf([
    maybe(literal(', ')),
    // REQUIRED
    DimensionNextSpace,
    // REQUIRED
    sequenceOf([ParseCssDimensions, whitespace]).map((x) => x[0]),
    // OPTIONAL
    maybe(sequenceOf([DimensionNextSpace, DimensionNextSpace, ParseCssColor])),
  ]),
).mapFromData((x): ShadowStyleIOS => {
  const shadow = x.result[0]!;
  return {
    shadowOffset: {
      width: shadow[1],
      height: shadow[2],
    },
    shadowRadius: shadow[3]?.[0] && shadow[3]![0],
    shadowOpacity: shadow[3]?.[1] && shadow[3]![1],
    shadowColor: shadow[3]?.[2],
  };
});

const ParseTranslateValue = sequenceOf([
  literal('translate'),
  char('('),
  ParseCssDimensions,
  maybe(literal(', ')),
  maybe(ParseCssDimensions),
  char(')'),
]).mapFromData((x) => {
  const styles: AnyStyle['transform'] = [{ translateX: x.result[2] }];
  if (x.result[4]) {
    styles.push({
      translateY: x.result[4],
    });
  }
  return styles;
});

const ParseRotateValue = sequenceOf([
  choice([literal('rotateX'), literal('rotateY'), literal('rotateZ'), literal('rotate')]),
  char('('),
  ParseCssDimensions,
  char(')'),
]).mapFromData((x): AnyStyle['transform'] => {
  if (x.result[0] === 'rotateX') {
    return [{ rotateX: `${x.result[2]}` }];
  }
  if (x.result[0] && 'rotateY') {
    return [{ rotateY: `${x.result[2]}` }];
  }

  if (x.result[0] && 'rotateZ') {
    return [{ rotateZ: `${x.result[2]}` }];
  }

  return [{ rotate: `${x.result[2]}` }];
});
// translate(1px, 2px)
// translateX(1px)
// translateY(1px)
// rotate(1px, 2px, 3px)
// rotateX(1px)
// rotateY(1px)
// rotateZ(1px)
/*
 ************ RULE BLOCK ***********
 */

const ParseCssDeclarationLine = coroutine((run) => {
  const getValue = () => {
    const property = run(parseDeclarationProperty);
    const meta = getPropertyValueType(property);
    if (meta === 'DIMENSION') {
      return {
        [kebab2camel(property)]: run(ParseCssDimensions),
      };
    }
    if (meta === 'FLEX') {
      return run(ParseFlexValue);
    }

    if (meta === 'SHADOW') {
      return run(ParseShadowValue);
    }

    if (meta === 'TRANSFORM') {
      return {
        transform: run(choice([ParseTranslateValue, ParseRotateValue])),
      };
    }

    if (meta === 'COLOR') {
      const value = run(ParseCssColor);
      return {
        [kebab2camel(property)]: value,
      };
    }
    return {
      [kebab2camel(property)]: run(ident),
    };
  };

  const composeValue = (result: AnyStyle = {}): AnyStyle => {
    run(maybe(char(';')));
    const isValid = run(peek) !== '}';
    if (!isValid) return result;
    let value = {
      ...result,
      ...getValue(),
    };
    if (run(peek) === ';') {
      return composeValue(value);
    }
    return value;
  };

  return composeValue();
});

export const ParseCss = recursiveParser(() => choice([ParseCssAtRule, ParseCssRuleBlock]));

const GetAtRuleConditionToken = sequenceOf([parseDeclarationProperty, ParseCssDimensions]);

const ParseCssAtRule = coroutine((run) => {
  const context = run(getData);
  run(literal('@media'));
  run(whitespace);
  const mediaRuleConstrains = run(betweenParens(GetAtRuleConditionToken));
  if (
    evaluateMediaQueryConstrains(
      { property: mediaRuleConstrains[0], value: mediaRuleConstrains[1] },
      context,
    )
  ) {
    const rule = run(betweenBrackets(ParseCssRuleBlock));
    return rule;
  }
  return null;
});

const ParseCssRuleBlock = sequenceOf([
  ParseCssSelector,
  betweenBrackets(ParseCssDeclarationLine),
]).map((x) => {
  return {
    selector: x[0],
    declarations: x[1],
  };
});

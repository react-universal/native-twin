import * as P from '@universal-labs/css/parser';
import { inspect } from 'util';
import { ParsedRule } from '../types/parser.types';

interface VariantToken {
  type: 'VARIANT';
  value: {
    important: boolean;
    name: string;
  }[];
}
interface ColorModifierToken {
  type: 'COLOR_MODIFIER';
  value: string;
}
interface ClassNameToken {
  type: 'CLASS_NAME';
  value: {
    important: boolean;
    name: string;
    modifier: ColorModifierToken | null;
  };
}
interface VariantClassToken {
  type: 'VARIANT_CLASS';
  value: [VariantToken, ClassNameToken];
}
interface ArbitraryToken {
  type: 'ARBITRARY';
  value: string;
}
interface GroupToken {
  type: 'GROUP';
  value: {
    base: ClassNameToken | VariantToken;
    content: (ClassNameToken | GroupToken | VariantClassToken | ArbitraryToken)[];
  };
}

// UTILS
const classNameIdent = /^[a-z0-9A-Z-.]+/;

const matchBetweenParens = P.between(P.char('('))(P.char(')'));

const mapResult =
  <Type extends string>(type: Type) =>
  <Value>(value: Value) => ({
    type,
    value,
  });
const mapArbitrary = mapResult('ARBITRARY');
const mapClassName = mapResult('CLASS_NAME');
const mapVariant = mapResult('VARIANT');
const mapVariantClass = mapResult('VARIANT_CLASS');
// const mapGroupName = mapResult('GROUP_NAME');
const mapGroup = mapResult('GROUP');
const mapColorModifier = mapResult('COLOR_MODIFIER');

const validValues = P.recursiveParser(
  (): P.Parser<GroupToken | VariantClassToken | ClassNameToken> =>
    P.choice([matchGroup, matchVariantClass, matchClassName]),
);

// CLASSNAMES

/** Match value inside [...] */
const matchArbitrary = P.between(P.char('['))(P.char(']'))(P.everyCharUntil(']')).map(
  (x) => `[${x}]`,
);

const colorModifier = P.sequenceOf([P.char('/'), P.choice([P.digits, matchArbitrary])]).map(
  (x) => mapColorModifier(x[1]),
);

const maybeImportant = P.maybe(P.char('!')).map((x) => !!x);

const matchVariant = P.many1(
  P.sequenceOf([maybeImportant, P.regex(classNameIdent), P.char(':')]),
).map(
  (x): VariantToken =>
    mapVariant(
      x.map((y) => ({
        important: y[0],
        name: y[1],
      })),
    ),
);

const matchClassName = P.sequenceOf([
  maybeImportant,
  P.regex(classNameIdent),
  P.maybe(matchArbitrary),
  P.maybe(colorModifier),
]).map(
  (x): ClassNameToken =>
    mapClassName({
      important: x[0],
      name: x[1] + (x[2] ? x[2] : ''),
      modifier: x[3],
    }),
);

const matchVariantClass = P.sequenceOf([matchVariant, matchClassName]).map(
  (x): VariantClassToken => mapVariantClass(x),
);

// GROUPS

const matchGroupContent = matchBetweenParens(
  P.separatedBySpace(
    P.choice([validValues, matchArbitrary.map((x): ArbitraryToken => mapArbitrary(x))]),
  ),
);

const matchGroup = P.sequenceOf([
  P.choice([matchVariant, matchClassName]),
  matchGroupContent,
]).map(
  (x): GroupToken =>
    mapGroup({
      base: x[0],
      content: x[1],
    }),
);

const classParser = P.separatedBySpace(validValues);

function translateRules(
  tokens: (GroupToken | VariantClassToken | ClassNameToken | ArbitraryToken)[],
  result: ParsedRule[] = [],
): ParsedRule[] {
  const current = tokens.shift();
  if (!current) return result;
  if (current.type == 'CLASS_NAME') {
    result.push({
      n: current.value.name,
      v: [],
      i: current.value.important,
      m: current.value.modifier,
    });
    return translateRules(tokens, result);
  }
  if (current.type == 'VARIANT_CLASS') {
    result.push({
      n: current.value[1].value.name,
      v: current.value[0].value.map((x) => x.name),
      i: current.value[1].value.important || current.value[0].value.some((x) => x.important),
      m: current.value[1].value.modifier,
    });
    return translateRules(tokens, result);
  }
  if (current.type == 'GROUP') {
    const baseValue = current.value.base;
    const content = mergeGroups(current.value.content).map((x) => {
      if (baseValue.type == 'CLASS_NAME') {
        return {
          ...x,
          i: baseValue.value.important,
          m: baseValue.value.modifier,
          n: baseValue.value.name + '-' + x.n,
        };
      }
      return {
        ...x,
        v: [...x.v, ...baseValue.value.map((y) => y.name)],
        i: x.i || baseValue.value.some((y) => y.important),
      };
    });
    result.push(...content);
    return translateRules(tokens, result);
  }
  return result;
}

function mergeGroups(
  groupContent: (ClassNameToken | VariantClassToken | ArbitraryToken | GroupToken)[],
  results: ParsedRule[] = [],
): ParsedRule[] {
  let nextToken = groupContent.shift();
  if (!nextToken) return results;
  if (nextToken.type == 'ARBITRARY') {
    results.push({
      n: nextToken.value,
      v: [],
      i: false,
    });
  }
  if (nextToken.type == 'CLASS_NAME') {
    results.push({
      n: nextToken.value.name,
      v: [],
      i: nextToken.value.important,
      m: nextToken.value.modifier,
    });
  }
  if (nextToken.type == 'VARIANT_CLASS') {
    results.push({
      n: nextToken.value[1].value.name,
      v: nextToken.value[0].value.map((y) => y.name),
      i:
        nextToken.value[1].value.important ||
        nextToken.value[0].value.some((y) => y.important),
      m: nextToken.value[1].value.modifier,
    });
  }
  if (nextToken.type == 'GROUP') {
    const baseValue = nextToken.value.base;
    const parts = mergeGroups(nextToken.value.content).map((x): ParsedRule => {
      if (baseValue.type == 'CLASS_NAME') {
        return {
          ...x,
          i: baseValue.value.important,
          m: baseValue.value.modifier,
          n: baseValue.value.name + '-' + x.n,
        };
      }
      return {
        ...x,
        v: [...x.v, ...baseValue.value.map((y) => y.name)],
        i: x.i || baseValue.value.some((y) => y.important),
      };
    });
    results.push(...parts);
  }
  return mergeGroups(groupContent, results);
}

export function parseTWTokens(rules: string) {
  const data = classParser.run(rules);
  inspect(data, false, null);
  if (data.isError) {
    // eslint-disable-next-line no-console
    console.warn('Failed parsing rules: ', rules);
    return [];
  }
  return translateRules(data.result);
}

// parseTWTokens('md:(text(center [16px] sm:(blue-200) hover:sm:(10xl)))'); //?
// parseTWTokens('px-2 mx-[10px] text(center 2xl) bg-blue-200 justify-center'); //?

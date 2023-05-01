import camelizeStyleName from 'fbjs/lib/camelizeStyleName';
import parse, { ParsedValue } from 'postcss-value-parser';
import TokenStream from './TokenStream';
import transforms from './transforms';

// Note if this is wrong, you'll need to change tokenTypes.ts too
const numberOrLengthRe = /^([+-]?(?:\d*\.)?\d+(?:[Ee][+-]?\d+)?)(?:px)?$/i;
const boolRe = /^true|false$/i;
const nullRe = /^null$/i;
const undefinedRe = /^undefined$/i;

// Undocumented export
export const transformRawValue = (input: string) => {
  const value = input.trim();

  const numberMatch = value.match(numberOrLengthRe);
  if (numberMatch !== null) return Number(numberMatch[1]);

  const boolMatch = input.match(boolRe);
  if (boolMatch !== null) return boolMatch[0].toLowerCase() === 'true';

  const nullMatch = input.match(nullRe);
  if (nullMatch !== null) return null;

  const undefinedMatch = input.match(undefinedRe);
  if (undefinedMatch !== null) return undefined;

  return value;
};

const baseTransformShorthandValue = (
  propName: keyof typeof transforms,
  inputValue: string,
) => {
  const ast: ParsedValue = parse(inputValue.trim());
  console.log('AST: ', ast);
  const tokenStream = new TokenStream(ast.nodes);
  return transforms[propName](tokenStream);
};

const transformShorthandValue =
  process.env['NODE_ENV'] === 'production'
    ? baseTransformShorthandValue
    : (propName: keyof typeof transforms, inputValue: string) => {
        try {
          return baseTransformShorthandValue(propName, inputValue);
        } catch (e) {
          throw new Error(`Failed to parse declaration "${propName}: ${inputValue}"`);
        }
      };

export const getStylesForProperty = (
  propName: keyof typeof transforms,
  inputValue: string,
  allowShorthand: boolean,
) => {
  const isRawValue = allowShorthand === false || !(propName in transforms);
  const propValue = isRawValue
    ? transformRawValue(inputValue)
    : transformShorthandValue(propName, inputValue.trim());

  return propValue && propValue.$merge ? propValue.$merge : { [propName]: propValue };
};

export const getPropertyName = camelizeStyleName;

export default (rules: [string, string][], shorthandBlacklist: string[] = []) =>
  rules.reduce((prev, rule) => {
    const propertyName = getPropertyName(rule[0]);
    console.log('propertyName', propertyName);
    const value = rule[1];
    const allowShorthand = shorthandBlacklist.indexOf(propertyName) === -1;
    return Object.assign(prev, getStylesForProperty(propertyName, value, allowShorthand));
  }, {});

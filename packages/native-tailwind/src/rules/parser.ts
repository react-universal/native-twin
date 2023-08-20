import * as P from '@universal-labs/css/parser';
import { inspect } from 'util';
type NestedPattern = (string | string[])[];

const cache = new Map<string, any[]>();

const mapToken =
  <T extends string>(type: T) =>
  <U>(value: U) => ({
    type,
    value,
  });

const mapIdent = mapToken('IDENT');
const mapSection = mapToken('SECTION');
const mapGroupModifiers = mapToken('GROUP_MODIFIERS');
const mapBaseGroup = mapToken('BASE_GROUP');
const mapFullUtility = mapToken('FULL_UTILITY');
const mapGroup = mapToken('GROUP');

const matchClassFragment = P.many1(P.choice([P.char('-'), P.letters, P.digits, P.char(':')])).map((x) =>
  x.join(''),
);

const matchClassGroupsOrIdent = P.recursiveParser(() =>
  P.choice([matchClassGroups, matchClassFragment]),
).map((x) => {
  if (typeof x == 'string') {
    return mapSection(x);
  }
  return mapGroup(x);
});

const matchClassSectionsInGroup = P.sequenceOf([
  P.optionalWhitespace,
  P.char('('),
  P.optionalWhitespace,
  P.separatedBySpace(matchClassGroupsOrIdent),
  P.optionalWhitespace,
  P.char(')'),
  P.optionalWhitespace,
]).map((x) => x[3]);

const matchClassGroups = P.sequenceOf([
  matchClassFragment.map(mapBaseGroup),
  matchClassSectionsInGroup.map(mapGroupModifiers),
  P.optionalWhitespace,
]).map((x) => [x[0], x[1]]);

const matchAllUtilities = P.choice([matchClassGroups, matchClassFragment.map(mapFullUtility)]);

const matchClassNamesAndGroups = P.separatedBySpace(matchAllUtilities);

export function tokenParserInterpreter(tokens: any[]) {}

export function parser(text: string) {
  const result = matchClassNamesAndGroups.run(
    text,
    P.createParserContext({
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
    }),
  );
  Reflect.deleteProperty(result, 'data');
  if (result.isError) {
    return null;
  }
  return result.result;
}

const result = inspect(
  parser('text-2xl bg-( black  md:( m sm(a group( aaaa  bb) ) ) )'),
  false,
  null,
); //?

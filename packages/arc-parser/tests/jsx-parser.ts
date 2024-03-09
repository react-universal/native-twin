import * as P from '../src';

const example = `
  <div className="asd">
    sadad
  </div>
`;

const createTag =
  <T extends string>(type: T) =>
  <V>(value: V) => ({
    type,
    value,
  });

const mapToOpenTag = createTag('OPEN_TAG');
const mapToCloseTag = createTag('CLOSE_TAG');
const mapToAutoCloseTag = createTag('AUTO_CLOSE_TAG');

const simpleTagParser = P.sequenceOf([
  P.char('<').map(mapToOpenTag),
  P.everyCharUntil('>'),
  P.char('>').map(mapToCloseTag),
]);

const autoCloseTagParser = P.sequenceOf([
  P.char('<').map(mapToOpenTag),
  P.everyCharUntil('/'),
  P.sequenceOf([P.char('/'), P.skip(P.optionalWhitespace), P.char('>')]).map((x) =>
    mapToCloseTag(x[0] + x[2]),
  ),
]).map(mapToAutoCloseTag);

const parseBreakLine = P.regex(/\n/);

const parseAnyTag = P.choice([
  simpleTagParser,
  P.alphanumeric.map(createTag('TAG_CONTENT')),
  autoCloseTagParser,
  P.skip(parseBreakLine),
]);

const jsxParser = P.many1(
  P.whitespaceSurrounded(
    parseAnyTag.map((x) => {
      if (typeof x == 'string') {
        return null;
      }
      return x;
    }),
  ),
).map((x) =>
  x.filter((y) => {
    return Boolean(y);
  }),
);

jsxParser.run(example); //?

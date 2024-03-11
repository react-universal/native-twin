/* eslint-disable no-console */
import * as P from '../src';

const example = `
  <div className="asd">
    sadad<div className="123" />
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
const mapToTagChild = createTag('TAG_CHILD');
const mapTagNameTag = createTag('TAG_NAME');
const mapToAutoCloseTag = createTag('AUTO_CLOSE_TAG');
const mapTagProperty = createTag('TAG_PROPERTY');

const parseTagNameIdent = P.regex(/^[0-9a-zA-Z]+/);
const betweenTags = P.between(P.sequenceOf([P.char('<'), P.maybe(P.char('/'))]))(
  P.sequenceOf([P.maybe(P.char('/')), P.char('>')]),
);

const parseHTMLValue = P.recursiveParser(() =>
  P.choice([parseProperties, parseString, parseTag, parseTagNameIdent, parser]),
);

const parseString = P.sequenceOf([P.char('"'), P.everyCharUntil('"'), P.char('"')]);

const parseTagProperty = P.sequenceOf([parseTagNameIdent, P.char('='), parseString]).map((x) =>
  mapTagProperty({
    name: x[0],
    value: x[2],
  }),
);

const parseProperties = P.separatedBy(P.whitespace)(parseTagProperty);

const parseTag = betweenTags(parseProperties);

const parser = P.separatedBy(parseTag)(parseHTMLValue);

const runParser = (stream: string) => {
  const result = parser.run(stream);
  if (result.isError) {
    console.log('ERROR_RESULT: ' + result.cursor, result.error);
    return;
  }

  console.log('RESULT: ' + result.cursor, result.result);
};

const startTagExample = `<div className="asd">asd</div>`;
runParser(startTagExample);

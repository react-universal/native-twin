import * as P from '@universal-labs/css/parser';
import {
  ClassNameToken,
  ClassGroupToken,
  parseClassNameTokens,
  defaultParserContext,
} from './parser.utils';

const regexIdent = /^[_a-z0-9A-Z-!:]+/;

const parseVariants = P.many1(P.choice([P.regex(regexIdent)]));
const parseClassName = P.regex(regexIdent).map((x): ClassNameToken => {
  const name = x;
  return {
    type: 'CLASS_NAME',
    name,
    important: name.startsWith('!'),
    variant: x.includes(':'),
  };
});

const parseGroupValues = P.recursiveParser(() => P.choice([parseClassGroup, parseClassName]));

const parseClassGroup = P.sequenceOf([
  P.maybe(parseClassName).map(
    (x): ClassNameToken =>
      x ?? {
        type: 'CLASS_NAME',
        important: false,
        name: '',
        variant: false,
      },
  ),
  P.char('('),
  P.separatedBySpace(parseGroupValues),
  P.char(')'),
]).map((x): ClassGroupToken => {
  // console.log('XX: ', x);
  return {
    ...x[0],
    type: 'GROUP',
    list: x[2],
  };
}) as P.Parser<ClassGroupToken>;

const matchClassTokens = P.coroutine((run) => {
  let classNames: string[] = [];
  parseClasses();
  return classNames;

  function parseNextToken() {
    return run(parseClassName);
  }

  function parseGroups() {
    return run(parseClassGroup);
  }

  function parseClasses() {
    const canContinue = run(P.maybe(P.peek));
    if (!canContinue) return;
    if (canContinue == ' ') run(P.whitespace);
    let groups: ClassGroupToken | null = null;
    const baseToken = parseNextToken();
    const nextChar = run(P.lookAhead(P.peek));
    if (nextChar == '(') {
      groups = parseGroups();
    }
    const classes = createRule(baseToken, groups);
    classNames = classNames.concat(classes);
    return parseClasses();
  }

  function createRule(baseToken: ClassNameToken, groups: ClassGroupToken | null): string[] {
    console.log('TOKENS: ', { baseToken, groups });
    if (!groups) {
      return Array.of(`.${baseToken.name}`);
    }
    const classNames = groups.list.flatMap((rule) => {
      if (rule.type == 'GROUP') {
        if (rule.variant) {
          return createRule({ ...baseToken, name: rule.name }, rule);
        }
        return createRule(baseToken, rule);
      }
      return parseClassNameTokens(baseToken, rule);
    });
    return classNames;
  }
});

export function parseRawRules(text: string) {
  const result = matchClassTokens.run(text, defaultParserContext);
  if (result.isError) {
    // eslint-disable-next-line no-console
    console.log('ERROR: ', { error: result.error, cursor: result.cursor });
    return null;
  }
  return result.result;
}

// matchClassTokens.run(
//   'hover:focus:(a) md:(bg-black sm:(bg-blue-200)) bg-blue-300 xl:bg-white text-2xl',
//   defaultParserContext,
// ); /*?+*/

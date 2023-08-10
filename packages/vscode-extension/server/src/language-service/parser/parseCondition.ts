import ret, { types, Tokens, Root } from 'ret';
import { inspect } from 'util';

function evaluateParser(tokenList: TokenList): (string | string[])[] {
  const result: (string | string[])[] = [];
  tokenList.list.forEach((item) => {
    if (item.type == 'char') {
      result.push(item.value);
    }
    if (item.type == 'list') {
      if (item.parent == types.SET) {
        result.push(evaluateParser(item) as string[]);
      } else {
        result.push(evaluateParser(item) as unknown as string[]);
      }
    }
  });
  return result;
}

function joinGroups(input: (string | string[])[]) {
  let literal = '';
  let joins: string[] = [];
  for (const item of input) {
    if (typeof item == 'string') {
      literal += item;
    }
    if (Array.isArray(item)) {
      joins.push(...item);
    }
  }
  return [literal, joins];
}

function generatePatterns(result: (string | string[])[]) {
  let literalParts: [Offset: number, Text: string][] = [];
  const groups = joinGroups(result).flatMap((item) => {
    if (Array.isArray(item)) {
      return item;
    }
    return item;
  });
  console.log('GROUPS: ', groups);

  return literalParts;
}

export function parseCondition(expr: string) {
  console.log('EXP: ', expr);
  const result = ret(expr);
  const rootStackCondition = parseRegexRoot(result);
  const parsed = evaluateParser(rootStackCondition);
  const patterns = generatePatterns(parsed);
  console.groupEnd();
  return patterns;
}

function parseRegexRoot(token: Root): TokenList {
  const result: TokenList = {
    type: 'list',
    parent: types.ROOT,
    list: [],
  };
  if (token.type == types.ROOT && !token.stack) {
    return result;
  }
  if (token.type == types.ROOT && token.stack) {
    return parseTokenList(token.stack, types.ROOT);
  }
  return result;
}

function parseToken(token: Tokens): TokenResult {
  if (token.type == types.CHAR) {
    return mapChar(String.fromCharCode(token.value));
  }
  if (token.type == types.GROUP) {
    if (token.stack) {
      return parseTokenList(token.stack, token.type);
    }
    if (token.options) {
      let list: TokenList = {
        type: 'list',
        parent: token.type,
        list: [],
      };
      for (const current of token.options) {
        list.list.push(parseTokenList(current, token.type));
      }
      return list;
    }
  }
  if (token.type == types.SET) {
    if (!token.not) {
      return parseTokenList(token.set, token.type);
    }
    return parseTokenList([], token.type);
  }
  if (token.type == types.REPETITION && token.max !== Infinity) {
    return parseToken(token.value);
  }
  return {
    type: 'none',
    value: '',
  };
}

function parseTokenList(tokens: Tokens[], parent: types): TokenList {
  return {
    type: 'list',
    parent,
    list: tokens.map((item) => {
      return parseToken(item);
    }),
  };
}

const mapToken =
  <T extends string>(type: T) =>
  <Value>(value: Value) => {
    return {
      type,
      value,
    };
  };
const mapChar = mapToken('char');

type TokenKinds = 'group' | 'char' | 'set' | 'repetition' | 'position' | 'none';
type TokenNode = {
  type: TokenKinds;
  value: string;
};

interface TokenList {
  type: 'list';
  parent: types;
  list: TokenResult[];
}

type TokenResult = TokenNode | TokenList;

// DICT
// types.ROOT = 0
// types.GROUP = 1
// types.POSITION = 2
// types.SET = 3
// types.RANGE = 4
// types.REPETITION = 5
// types.REFERENCE = 6
// types.CHAR = 7

inspect(parseCondition('^resize(?:-(none|x|y))?$'), false, null, false); // ??

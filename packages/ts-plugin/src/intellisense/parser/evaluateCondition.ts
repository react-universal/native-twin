import ret, { Token, types } from 'ret';
import { inspect } from 'util';

function createTokens(expr: string) {
  const root = ret(expr);
  let parsedRoot: any[] = [];
  if (root.stack) {
    for (const current of root.stack) {
      parsedRoot.push(parseToken(current));
    }
  }
  return parsedRoot;
}

function parseToken(token: Token) {
  if (token.type == types.CHAR) {
    return String.fromCharCode(token.value);
  }
  return null;
}

inspect(createTokens('^resize(?:-(none|x|y))?$'), false, null, false);

import * as P from '@universal-labs/arc-parser';

const regexIdent = /^[_a-z0-9A-Z-]+/;
export const ident: P.Parser<string> = P.regex(regexIdent);

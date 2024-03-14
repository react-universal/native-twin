import * as P from '@native-twin/arc-parser';

const regexIdent = /^[_a-z0-9A-Z-]+/;
export const ident: P.Parser<string> = P.regex(regexIdent);

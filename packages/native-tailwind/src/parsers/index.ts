import { parseRawClassTokens } from './classes.parser';
import { defaultParserContext } from './parser.utils';

export * from './parser.utils';

export function parseRawRules(text: string) {
  const result = parseRawClassTokens.run(text, defaultParserContext);
  if (result.isError) {
    // eslint-disable-next-line no-console
    console.log('ERROR: ', { error: result.error, cursor: result.cursor });
    return [];
  }
  return result.result;
}

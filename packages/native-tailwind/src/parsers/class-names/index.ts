import { parseRawClassTokens } from './classes.parser';
export * from './parser.utils';

export function parseRawRules(text: string) {
  const result = parseRawClassTokens.run(text);
  if (result.isError) {
    // eslint-disable-next-line no-console
    console.warn('WARN: ', { error: result.error, cursor: result.cursor });
    return [];
  }
  return result.result;
}

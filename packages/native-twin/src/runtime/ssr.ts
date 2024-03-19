import {
  parseTWTokens,
  parsedRuleToClassName,
  sheetEntriesToCss,
  parseHTML,
} from '@native-twin/css';
import type { SheetEntry } from '@native-twin/css';
import {
  compareClassNames,
  fixHTMLTagClassNamesList,
  type StringLike,
} from '@native-twin/helpers';
import type { RuntimeTW } from '../types/theme.types';
import { tw as tw$ } from './tw';

export interface ExtractResult {
  /** The possibly modified HTML */
  html: string;
  /** The generated CSS */
  css: string;
}

export function extract(html: string, tw: RuntimeTW<any> = tw$): ExtractResult {
  const restore = tw.snapshot();
  const result = {
    html: consume(html, tw),
    css: sheetEntriesToCss(tw.target as any),
  };

  restore();

  return result;
}

export function consume(
  markup: string,
  tw: (className: StringLike) => SheetEntry[] = tw$,
): string {
  let result = '';
  let lastChunkStart = 0;

  parseHTML(markup, (startIndex, endIndex, quote) => {
    const value = markup.slice(startIndex, endIndex);
    const classList = parseTWTokens(fixHTMLTagClassNamesList(value, quote))
      .map(parsedRuleToClassName)
      .join(' ');
    tw(classList);
    // We only need to shift things around if we need to actually change the markup
    if (compareClassNames(value, classList)) {
      // We've hit another mutation boundary

      // Add quote if necessary
      quote = quote ? '' : '"';

      result += markup.slice(lastChunkStart, startIndex) + quote + classList + quote;

      lastChunkStart = endIndex;
    }
  });
  // Combine the current result with the tail-end of the input
  return result + markup.slice(lastChunkStart, markup.length);
}

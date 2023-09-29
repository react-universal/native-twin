import { sheetEntriesToCss } from '../css/translate';
import type { SheetEntry } from '../types/css.types';
import type { RuntimeTW } from '../types/theme.types';
import type { StringLike } from '../types/util.types';
import { changed } from '../utils/css-utils';
import { fixClassList, parseHTML } from '../utils/parse-html';
import { toClassName } from '../utils/string-utils';
import { tw as tw$ } from './tw';

export interface ExtractResult {
  /** The possibly modified HTML */
  html: string;
  /** The generated CSS */
  css: string;
}

export function extract(html: string, tw: RuntimeTW<any> = tw$): ExtractResult {
  // const restore = tw.snapshot();
  const html2 = consume(html, tw);
  const css = sheetEntriesToCss(tw.target, tw.config.theme['screens']);
  const result = {
    html: html2,
    css,
  };

  // restore();

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
    const className = tw(fixClassList(value, quote))
      .map((x) => toClassName(x.rule))
      .join(' ');

    // We only need to shift things around if we need to actually change the markup
    if (changed(value, className)) {
      // We've hit another mutation boundary

      // Add quote if necessary
      quote = quote ? '' : '"';

      result += markup.slice(lastChunkStart, startIndex) + quote + className + quote;

      lastChunkStart = endIndex;
    }
  });
  // Combine the current result with the tail-end of the input
  return result + markup.slice(lastChunkStart, markup.length);
}

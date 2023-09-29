import { sheetEntriesToCss } from '../css/translate';
import { tw as tw$ } from '../runtime';
import type { SheetEntry } from '../types/css.types';
import type { RuntimeTW } from '../types/theme.types';
import type { StringLike } from '../types/util.types';
import { changed } from '../utils/css-utils';
import { fixClassList, parseHTML } from '../utils/parse-html';
import { toClassName } from '../utils/string-utils';

/**
 * Result of {@link extract}
 */
export interface ExtractResult {
  /** The possibly modified HTML */
  html: string;

  /** The generated CSS */
  css: string;
}

/**
 * Used for static HTML processing (usually to provide SSR support for your javascript-powered web apps)
 *
 * **Note**: Consider using {@link inline} instead.
 *
 * 1. parse the markup and process element classes with the provided NativeTailwind instance
 * 2. update the class attributes _if_ necessary
 * 3. return the HTML string with the final element classes
 *
 * ```js
 * import { extract } from '@universal-labs/native-tailwind'
 *
 * function render() {
 *   const { html, css } = extract(renderApp())
 *
 *   // inject as last element into the head
 *   return html.replace('</head>', `<style data-native-tailwind>${css}</style></head>`)
 * }
 * ```
 *
 * You can provide your own NativeTailwind instance:
 *
 * ```js
 * import { extract } from '@universal-labs/native-tailwind'
 * import { tw } from './custom/native-tailwind/instance'
 *
 * function render() {
 *   const { html, css } = extract(renderApp(), tw)
 *
 *   // inject as last element into the head
 *   return html.replace('</head>', `<style data-native-tailwind>${css}</style></head>`)
 * }
 * ```
 *
 * @group Static Extraction
 * @param markup HTML to process
 * @param tw a {@link NativeTailwind} instance (default: NativeTailwind managed tw)
 * @returns the possibly modified html and css
 */
export function extract(html: string, tw: RuntimeTW<any> = tw$): ExtractResult {
  // const restore = tw.snapshot();
  const html2 = consume(html, tw);
  const css = sheetEntriesToCss(tw.target, tw.config.theme['screens']);
  console.log('CONSUME: ', html2);
  console.log('CSS: ', css);
  const result = {
    html: html2,
    css,
  };

  // restore();

  return result;
}

/**
 * Used for static HTML processing (usually to provide SSR support for your javascript-powered web apps)
 *
 * **Note**: Consider using {@link inline} or {@link extract} instead.
 *
 * 1. parse the markup and process element classes with the provided NativeTailwind instance
 * 2. update the class attributes _if_ necessary
 * 3. return the HTML string with the final element classes
 *
 * ```js
 * import { consume, stringify, tw } from '@universal-labs/native-tailwind'
 *
 * function render() {
 *   const html = renderApp()
 *
 *   // remember global classes
 *   const restore = tw.snapshot()
 *
 *   // generated markup
 *   const markup = consume(html)
 *
 *   // create CSS
 *   const css = stringify(tw.target)
 *
 *   // restore global classes
 *   restore()
 *
 *   // inject as last element into the head
 *   return markup.replace('</head>', `<style data-native-tailwind>${css}</style></head>`)
 * }
 * ```
 *
 * You can provide your own NativeTailwind instance:
 *
 * ```js
 * import { consume, stringify } from '@universal-labs/native-tailwind'
 * import { tw } from './custom/native-tailwind/instance'
 *
 * function render() {
 *   const html = renderApp()
 *
 *   // remember global classes
 *   const restore = snapshot(tw.target)
 *
 *   // generated markup
 *   const markup = consume(html)
 *
 *   // restore global classes
 *   restore()
 *
 *   // create CSS
 *   const css = stringify(tw.target)
 *
 *   // inject as last element into the head
 *   return markup.replace('</head>', `<style data-native-tailwind>${css}</style></head>`)
 * }
 * ```
 *
 * @group Static Extraction
 * @param markup HTML to process
 * @param tw a {@link NativeTailwind} instance
 * @returns possibly modified HTML
 */
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

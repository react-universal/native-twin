/**
 * Determines if two class name strings contain the same classes.
 *
 * @param a first class names
 * @param b second class names
 * @returns are they different
 */
export function compareClassNames(a: string, b: string): boolean {
  return a != b && '' + a.split(' ').sort() != '' + b.split(' ').sort();
}

/**
 * Converts the given input to a color value.
 * @param {string} color - The input to be converted to a color value.
 * @returns {string} - The resulting color value.
 *
 * @example
 * // returns "#FFFFFF"
 * toColorValue(255, 255, 255);
 */
export function toColorValue(
  color: string,
  options = {
    opacityValue: '1',
  },
): string {
  if (color[0] == '#' && (color.length == 4 || color.length == 7)) {
    color = color.replace('#', '');
    var r = parseInt(color.length == 3 ? color.slice(0, 1).repeat(2) : color.slice(0, 2), 16);
    var g = parseInt(color.length == 3 ? color.slice(1, 2).repeat(2) : color.slice(2, 4), 16);
    var b = parseInt(color.length == 3 ? color.slice(2, 3).repeat(2) : color.slice(4, 6), 16);
    return `rgba(${[r, g, b, options.opacityValue]})`;
  }

  if (options.opacityValue == '1') return color;

  if (options.opacityValue == '0') return '#0000';
  return color.replace(/^(rgb|hsl)(\([^)]+)\)$/, `$1a$2,${options.opacityValue})`);
}

/**
 * @description CSS Selector Escape
 */
export function escapeSelector(string: string) {
  return (
    string
      // Simplified escape testing only for chars that we know happen to be in tailwind directives
      .replace(/[!"'`*+.,;:\\/<=>?@#$%&^|~()[\]{}]/g, '\\$&')
      // If the character is the first character and is in the range [0-9] (2xl, ...)
      // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
      .replace(/^\d/, '\\3$& ')
  );
}

// spell-checker: disable
export function fixHTMLTagClassNamesList(value: string, quote: string): string {
  // const value = markup.slice(startIndex, endIndex)
  // Lets handle some special react cases:
  //   * arbitrary values for `content-`
  //     <span class="before:content-[&#x27;asas&#x27;]"></span>
  //     <span class="before:content-[&quot;asas&quot;]"></span>
  //
  //   * self-referenced groups
  //     <span class="flex(&amp; col)"></span>
  //
  //     If a class name contains `'`, `"`, or `&` those will be replaced with HTML entities
  //     To fix this we replace those for depending on the actual symbol that is being used
  //     As an alternative we could always escape class names direcly in tailwind like react does
  //     but this works for now
  return (
    quote == `"`
      ? // `'` -> &#39; &apos; &#x27;
        value.replace(/(=|\[)(?:&#39;|&apos;|&#x27;)|(?:&#39;|&apos;|&#x27;)(])/g, `$1'$2`)
      : quote == `'`
        ? // `"` -> &#34; &quot; &#x22;
          value.replace(/(=|\[)(?:&#34;|&quot;|&#x22;)|(?:&#34;|&quot;|&#x22;)(])/g, `$1"$2`)
        : value
  ).replace(/(&#38;|&amp;|&#x26;)/g, '&');
}

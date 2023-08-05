import type { ParsedRule } from '@universal-labs/twind-adapter';

export function separatorPrecedence(string: string): number {
  return string.match(/[-=:;]/g)?.length || 0;
}

export function atRulePrecedence(css: string): number {
  // 0 - 15: 4 bits (max 144rem or 2304px)
  // rem -> bit
  // <20 ->  0 (<320px)
  //  20 ->  1 (320px)
  //  24 ->  2 (384px)
  //  28 ->  3 (448px)
  //  32 ->  4 (512px)
  //  36 ->  5 (576px)
  //  42 ->  6 (672px)
  //  48 ->  7 (768px)
  //  56 ->  8 (896px)
  //  64 ->  9 (1024px)
  //  72 -> 10 (1152px)
  //  80 -> 11 (1280px)
  //  96 -> 12 (1536px)
  // 112 -> 13 (1792px)
  // 128 -> 14 (2048px)
  // 144 -> 15 (2304px)
  // https://www.dcode.fr/function-equation-finder
  return (
    (Math.min(
      /(?:^|width[^\d]+)(\d+(?:.\d+)?)(p)?/.test(css)
        ? Math.max(0, 29.63 * (+RegExp.$1 / (RegExp.$2 ? 15 : 1)) ** 0.137 - 43)
        : 0,
      15,
    ) <<
      22) /* Shifts.responsive */ |
    (Math.min(separatorPrecedence(css), 15) << 18) /* Shifts.atRules */
  );
}

export function toCondition(value: string | RegExp): RegExp {
  // "visible" -> /^visible$/
  // "(float)-(left|right|none)" -> /^(float)-(left|right|none)$/
  // "auto-rows-" -> /^auto-rows-/
  // "gap(-|$)" -> /^gap(-|$)/
  return typeof value == 'string'
    ? new RegExp('^' + value + (value.includes('$') || value.slice(-1) == '-' ? '' : '$'))
    : value;
}

export function toClassName(rule: ParsedRule): string {
  return [...rule.v, (rule.i ? '!' : '') + rule.n].join(':');
}

export function fixClassList(value: string, quote: string): string {
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
  //     As an alternative we could always escape class names direcly in twind like react does
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

export function spacify(value: string): string {
  return (value[0] === '-' ? '- ' : '') + value.replace(/[-\s]+/g, ' ');
}

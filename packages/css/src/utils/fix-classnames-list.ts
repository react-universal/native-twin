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

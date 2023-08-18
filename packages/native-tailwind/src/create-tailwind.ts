interface SortableRule {
  /** The calculated precedence taking all variants into account. */
  precedenceCalc: number;
  /* The precedence of the properties within {@link d}. */
  propertyPrecedence: number;
  /** The name to use for `&` expansion in selectors. Maybe empty for at-rules like `@import`, `@font-face`, `@media`, ... */
  name?: string | null;
}
function tailwind() {
  // Map of tokens to generated className
  let cache = new Map<string, string>();

  // An array of precedence by index within the sheet
  // always sorted
  let sortedPrecedences: SortableRule[] = [];

  // Cache for already inserted css rules
  // to prevent double insertions
  let insertedRules = new Set<string>();

  return Object.defineProperties(function tw(tokens: string) {
    tokens = '' + tokens;
    let className = cache.get(tokens);
    if (!className) {
      const classNames = new Set<string | undefined>();
    }
  }, Object.getOwnPropertyDescriptors({}));
}

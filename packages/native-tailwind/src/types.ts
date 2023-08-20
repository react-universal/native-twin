export interface SortableRule {
  /** The calculated precedence taking all variants into account. */
  precedenceCalc: number;
  /* The precedence of the properties within {@link d}. */
  propertyPrecedence: number;
  /**
   * The name to use for `&` expansion in selectors.
   * Maybe empty for at-rules like `@import`, `@font-face`, `@media`, ...
   */
  name?: string | null;
}

export interface ParsedRule {
  /**
   * The utility name including `-` if set, but without `!` and variants
   */
  readonly n: string;

  /**
   * All variants without trailing colon: `hover`, `after:`, `[...]`
   */
  readonly v: string[];

  /**
   * Something like `!underline` or `!bg-red-500` or `!red-500`
   */
  readonly i?: boolean;
}

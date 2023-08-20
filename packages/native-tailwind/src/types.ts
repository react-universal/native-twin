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

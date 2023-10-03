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

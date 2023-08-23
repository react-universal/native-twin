import { SortableRule } from './parsers/types';

export function tailwind() {
  // Map of tokens to generated className
  let cache = new Map<string, string>();

  // An array of precedence by index within the sheet
  // always sorted
  let sortedPrecedences: SortableRule[] = [];

  // Cache for already inserted css rules
  // to prevent double insertions
  let insertedRules = new Set<string>();

  return Object.defineProperties(
    function tw(tokens: string) {
      tokens = '' + tokens;
      let className = cache.get(tokens);
      if (!className) {
        const classNames = new Set<string | undefined>();
      }
    },
    Object.getOwnPropertyDescriptors({
      theme: {},
    }),
  );
}

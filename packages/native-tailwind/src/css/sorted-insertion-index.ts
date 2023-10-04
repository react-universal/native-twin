import { Layer } from '@universal-labs/css';
import type { ParsedRule } from '../types/tailwind.types';

const collator = new Intl.Collator('en', { numeric: true });

/**
 * Find the array index of where to add an element to keep it sorted.
 *
 * @returns The insertion index
 */
export function sortedInsertionIndex(
  array: readonly ParsedRule[],
  element: ParsedRule,
): number {
  // Find position using binary search
  for (var low = 0, high = array.length; low < high; ) {
    const pivot = (high + low) >> 1;

    // Less-Then-Equal to add new equal element after all existing equal elements (stable sort)
    if (array[pivot] && compareTwRules(array[pivot]!, element) <= 0) {
      low = pivot + 1;
    } else {
      high = pivot;
    }
  }

  return high;
}

export function compareTwRules(a: ParsedRule, b: ParsedRule): number {
  // base and overrides (css) layers are kept in order they are declared
  const layer = a.p & Layer.o;

  if (layer == (b.p & Layer.o) && (layer == Layer.b || layer == Layer.o)) {
    return 0;
  }

  return (
    a.p - b.p ||
    // a.o - b.o ||
    collator.compare(byModifier(a.n), byModifier(b.n)) ||
    collator.compare(byName(a.n), byName(b.n))
  );
}

function byModifier(s: string | null | undefined) {
  return ((s || '').split(/:/).pop() as string).split('/').pop() || '\x00';
}

function byName(s: string | null | undefined) {
  return (s || '').replace(/\W/g, (c) => String.fromCharCode(127 + c.charCodeAt(0))) + '\x00';
}

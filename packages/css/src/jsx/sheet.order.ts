export type OrderableSheetEntry<T = object> = T & { precedence: number; important: boolean };

/**
 * @description internal
 * @category Orders
 * */
const sheetEntriesOrderByPrecedence = <T>(
  a: OrderableSheetEntry<T>,
  b: OrderableSheetEntry<T>,
): number => (a.precedence === b.precedence ? 0 : a.precedence < b.precedence ? -1 : 1);

/**
 * @description internal
 * @category Orders
 * */
/** @category Orders */
const sheetEntriesByImportant = <T>(
  a: OrderableSheetEntry<T>,
  b: OrderableSheetEntry<T>,
): number => (a.important === b.important ? 0 : a.important < b.important ? -1 : 1);

/** @category Orders */
export const sortSheetEntries = <T>(
  a: OrderableSheetEntry<T>,
  b: OrderableSheetEntry<T>,
): number => {
  const first = sheetEntriesByImportant(a, b);
  if (first !== 0) return first;
  return sheetEntriesOrderByPrecedence(a, b);
};

/** @category Orders */
export const sortSheetEntriesArray = <T>(
  entries: OrderableSheetEntry<T>[],
): OrderableSheetEntry<T>[] => entries.toSorted(sortSheetEntries);

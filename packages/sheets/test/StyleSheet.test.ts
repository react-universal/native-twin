import { describe, expect, it } from 'vitest';
import { classNamesToArray, extractClassesGroups } from '../src/utils/splitClasses';

describe('@universal-labs/stylesheets', () => {
  it('splitClassNames', () => {
    const classNamesArray = classNamesToArray('flex-1 text-gray-700 hover:text-gray-200');
    expect(classNamesArray).toStrictEqual(['flex-1', 'text-gray-700', 'hover:text-gray-200']);
    const classesGroups = extractClassesGroups(classNamesArray);
    expect(classesGroups.pointerEventsClasses.length > 0).toBeTruthy();
  });
});

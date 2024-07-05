import { flattenObjectByPath } from '../src';

describe('Object utils', () => {
  it('flatten object', () => {
    const testObj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };
    const flatten = flattenObjectByPath(testObj); //?+
    flatten; //?
    expect(flatten).toStrictEqual({
      ...testObj,
      'b-c': 2,
      'b-d': {
        e: 3,
      },
      'b-d-e': 3,
    });
  });
});

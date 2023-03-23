import { describe, expect, it } from 'vitest';
import { createObservable } from '../src/store/observables';

describe('@universal-labs/stylesheets', () => {
  it('Observable', () => {
    const observer = createObservable({ a: 1 });
    // eslint-disable-next-line no-console
    observer.subscribe(console.log);
    observer.a = 2;
    expect(observer.a).toStrictEqual(2);
  });
});

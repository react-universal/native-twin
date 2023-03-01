import { describe, expect, test, vi } from 'vitest';
import { createObservable } from './observables';

describe('Observable proxy', () => {
  test('Set', () => {
    const proxy = createObservable({ count: 0 });
    const handler = vi.fn((args) => console.log('SUBS: ', args));
    proxy.subscribe(handler);
    proxy.count = proxy.count + 1;
    expect(handler).toBeCalled();
  });
});

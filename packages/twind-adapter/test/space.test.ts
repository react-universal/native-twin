import { beforeEach, describe, expect, it } from 'vitest';
import { initialize } from '../src';

const { tx, tw } = initialize({});
const stringify = (target: string[]) => target.join('');

describe('TailwindCSS Space', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Margin', () => {
    const className = tx('m-2');
    expect(className).toStrictEqual('m-2');
    expect(stringify(tw.target)).toStrictEqual('.m-2{margin:0.5rem}');
  });

  it('Margin Top', () => {
    const className = tx('mt-2');
    expect(className).toStrictEqual('mt-2');
    expect(stringify(tw.target)).toStrictEqual('.mt-2{margin-top:0.5rem}');
  });

  it('Space X', () => {
    const className = tx('space-y-2');
    expect(className).toStrictEqual('space-y-2');
    expect(stringify(tw.target)).toStrictEqual(
      '.space-y-2>:not([hidden])~:not([hidden]){margin-top:calc(0.5rem * calc(1 - 0));}',
    );
  });

  it('Divide X', () => {
    const className = tx('divide-x-2');
    expect(className).toStrictEqual('divide-x-2');
    expect(stringify(tw.target)).toStrictEqual(
      '.divide-x-2>:not([hidden])~:not([hidden]){border-left-width:calc(2px * calc(1 - 0));}',
    );
  });
});

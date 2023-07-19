import { beforeEach, describe, expect, it } from 'vitest';
import { initialize } from '../src';

const stringify = (target: string[]) => target.join('');

const { tx, tw } = initialize({});

describe('TailwindCSS compiler', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Normal color', () => {
    const className = tx('bg-black');
    expect(className).toStrictEqual('bg-black');
    expect(stringify(tw.target)).toStrictEqual('.bg-black{background-color:rgba(0,0,0,1);}');
  });

  it('Color with opacity', () => {
    const className = tx('bg-black/50');
    expect(className).toStrictEqual('bg-black/50');
    expect(stringify(tw.target)).toStrictEqual(
      '.bg-black\\/50{background-color:rgba(0,0,0,0.5);}',
    );
  });

  it('Translations', () => {
    const className = tx('translate-x-8');
    expect(className).toStrictEqual('translate-x-8');
    expect(stringify(tw.target)).toStrictEqual('.translate-x-8{transform:translate(2rem)}');
  });
});

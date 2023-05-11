import { describe, expect, it } from 'vitest';
import { initialize, stringify } from '../src';

const { tx, tw } = initialize({});

describe('TailwindCSS compiler', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Normal color', () => {
    const className = tx('bg-black');
    expect(className).toStrictEqual('bg-black');
    console.log('CSS: ', tw.target);
    expect(stringify(tw.target)).toStrictEqual(
      '/*!dbgidc,w,bg-black*/.bg-black{--tw-bg-opacity:1;background-color:rgba(0,0,0,var(--tw-bg-opacity))}',
    );
  });

  it('Color with opacity', () => {
    const className = tx('bg-black/50');
    expect(className).toStrictEqual('bg-black/50');
    expect(stringify(tw.target)).toStrictEqual(
      '/*!dbgidc,w,bg-black/50*/.bg-black\\/50{background-color:rgba(0,0,0,0.5);}',
    );
  });

  it('Translations', () => {
    const className = tx('translate-x-8');
    expect(className).toStrictEqual('translate-x-8');
    expect(stringify(tw.target)).toStrictEqual(
      '/*!dbgidc,v,translate-x-8*/.translate-x-8{transform:translate(128px)}',
    );
  });
});

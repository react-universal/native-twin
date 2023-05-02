import { describe, expect, it } from 'vitest';
import { initialize, stringify } from '../src';

const { tx, tw } = initialize({});

describe('TailwindCSS Space', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Margin', () => {
    const className = tx('m-2');
    expect(className).toStrictEqual('m-2');
    expect(stringify(tw.target)).toStrictEqual('/*!dbgidc,v,m-2*/.m-2{margin:8px}');
  });

  it('Margin Top', () => {
    const className = tx('mt-2');
    expect(className).toStrictEqual('mt-2');
    expect(stringify(tw.target)).toStrictEqual('/*!dbgidc,y,mt-2*/.mt-2{margin-top:8px}');
  });

  it('Space X', () => {
    const className = tx('space-y-2');
    expect(className).toStrictEqual('space-y-2');
    expect(stringify(tw.target)).toStrictEqual(
      '/*!dbgidc,u,space-y-2*/.space-y-2>:not([hidden])~:not([hidden]){margin-top:calc(8px * calc(1 - 0));}',
    );
  });

  it('Divide X', () => {
    const className = tx('divide-x-2');
    expect(className).toStrictEqual('divide-x-2');
    expect(stringify(tw.target)).toStrictEqual(
      '/*!dbgidc,10,divide-x-2*/.divide-x-2>:not([hidden])~:not([hidden]){border-left-width:calc(2px * calc(1 - 0));}',
    );
  });
});

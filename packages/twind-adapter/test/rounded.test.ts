import { beforeEach, describe, expect, it } from 'vitest';
import { initialize } from '../src';

const { tx, tw } = initialize({});
const stringify = (target: string[]) => target.join('');

describe('TailwindCSS rounded', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const className = tx('rounded-xl');
    expect(className).toStrictEqual('rounded-xl');
    expect(stringify(tw.target)).toStrictEqual('.rounded-xl{border-radius:0.75rem}');
  });
});

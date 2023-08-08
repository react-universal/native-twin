import { describe, expect, it } from 'vitest';
import { Tailwind } from '../src';

const stringify = (target: string[]) => target.join('');
const { parseAndInject } = new Tailwind();

describe('TailwindCSS Aspect Ratio', () => {
  it('aspect-square', () => {
    const classNames = parseAndInject('aspect-square');
    expect(classNames.generated).toStrictEqual('aspect-square');
    expect(stringify(classNames.target)).toStrictEqual('.aspect-square{aspect-ratio:1/1}');
  });

  it('aspect-video', () => {
    const classNames = parseAndInject('aspect-video');
    expect(classNames.generated).toStrictEqual('aspect-video');
    expect(stringify(classNames.target)).toStrictEqual('.aspect-video{aspect-ratio:16/9}');
  });

  it('aspect-auto', () => {
    const classNames = parseAndInject('aspect-auto');
    expect(classNames.generated).toStrictEqual('aspect-auto');
    expect(stringify(classNames.target)).toStrictEqual('.aspect-auto{aspect-ratio:auto}');
  });
});

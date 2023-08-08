import { describe, expect, it } from 'vitest';
import { Tailwind } from '../src';

const stringify = (target: string[]) => target.join('');

const { parseAndInject } = new Tailwind({
  fontFamily: {
    DEFAULT: 'Inter-Regular',
    inter: 'Inter-Regular',
    'inter-bold': 'Inter-Bold',
    'inter-medium': 'Inter-Medium',
    sans: 'Inter-Regular',
  },
});

describe('TailwindCSS Position', () => {
  it('Right', () => {
    const classNames = parseAndInject('right-3');
    expect(classNames.generated).toStrictEqual('right-3');
    expect(stringify(classNames.target)).toStrictEqual('.right-3{right:0.75rem}');
  });

  it('Left', () => {
    const classNames = parseAndInject('left-3');
    expect(classNames.generated).toStrictEqual('left-3');
    expect(stringify(classNames.target)).toStrictEqual('.left-3{left:0.75rem}');
  });

  it('Top', () => {
    const classNames = parseAndInject('top-3');
    expect(classNames.generated).toStrictEqual('top-3');
    expect(stringify(classNames.target)).toStrictEqual('.top-3{top:0.75rem}');
  });

  it('Bottom', () => {
    const classNames = parseAndInject('bottom-3');
    expect(classNames.generated).toStrictEqual('bottom-3');
    expect(stringify(classNames.target)).toStrictEqual('.bottom-3{bottom:0.75rem}');
  });

  it('Inset', () => {
    const classNames = parseAndInject('inset-3');
    expect(classNames.generated).toStrictEqual('inset-3');
    expect(stringify(classNames.target)).toStrictEqual(
      '.inset-3{top:0.75rem;right:0.75rem;bottom:0.75rem;left:0.75rem}',
    );
  });

  it('Negative Inset', () => {
    const classNames = parseAndInject('-inset-3');
    expect(classNames.generated).toStrictEqual('-inset-3');

    expect(stringify(classNames.target)).toStrictEqual(
      '.-inset-3{top:calc(0.75rem * -1);right:calc(0.75rem * -1);bottom:calc(0.75rem * -1);left:calc(0.75rem * -1)}',
    );
  });

  it('Inset Y', () => {
    const classNames = parseAndInject('inset-y-3');
    expect(classNames.generated).toStrictEqual('inset-y-3');
    expect(stringify(classNames.target)).toStrictEqual(
      '.inset-y-3{top:0.75rem;bottom:0.75rem}',
    );
  });

  it('Negative Inset Y', () => {
    const classNames = parseAndInject('-inset-y-3');
    expect(classNames.generated).toStrictEqual('-inset-y-3');
    expect(stringify(classNames.target)).toStrictEqual(
      '.-inset-y-3{top:calc(0.75rem * -1);bottom:calc(0.75rem * -1)}',
    );
  });

  it('Negative Inset X', () => {
    const classNames = parseAndInject('-inset-x-3');
    expect(classNames.generated).toStrictEqual('-inset-x-3');

    expect(stringify(classNames.target)).toStrictEqual(
      '.-inset-x-3{right:calc(0.75rem * -1);left:calc(0.75rem * -1)}',
    );
  });

  it('Inset X', () => {
    const classNames = parseAndInject('inset-x-3');
    expect(classNames.generated).toStrictEqual('inset-x-3');
    expect(stringify(classNames.target)).toStrictEqual(
      '.inset-x-3{right:0.75rem;left:0.75rem}',
    );
  });
});

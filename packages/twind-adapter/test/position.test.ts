import { beforeEach, describe, expect, it } from 'vitest';
import { initialize } from '../src';

const stringify = (target: string[]) => target.join('');

const { tw, tx } = initialize({});

describe('TailwindCSS Position', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Right', () => {
    const classNames = tx('right-3');
    expect(classNames).toStrictEqual('right-3');
    expect(stringify(tw.target)).toStrictEqual('.right-3{right:0.75rem}');
  });

  it('Left', () => {
    const classNames = tx('left-3');
    expect(classNames).toStrictEqual('left-3');
    expect(stringify(tw.target)).toStrictEqual('.left-3{left:0.75rem}');
  });

  it('Top', () => {
    const classNames = tx('top-3');
    expect(classNames).toStrictEqual('top-3');
    expect(stringify(tw.target)).toStrictEqual('.top-3{top:0.75rem}');
  });

  it('Bottom', () => {
    const classNames = tx('bottom-3');
    expect(classNames).toStrictEqual('bottom-3');
    expect(stringify(tw.target)).toStrictEqual('.bottom-3{bottom:0.75rem}');
  });

  it('Inset', () => {
    const classNames = tx('inset-3');
    expect(classNames).toStrictEqual('inset-3');
    expect(stringify(tw.target)).toStrictEqual(
      '.inset-3{top:0.75rem;right:0.75rem;bottom:0.75rem;left:0.75rem}',
    );
  });

  it('Negative Inset', () => {
    const classNames = tx('-inset-3');
    expect(classNames).toStrictEqual('-inset-3');

    expect(stringify(tw.target)).toStrictEqual(
      '.-inset-3{top:calc(0.75rem * -1);right:calc(0.75rem * -1);bottom:calc(0.75rem * -1);left:calc(0.75rem * -1)}',
    );
  });

  it('Inset Y', () => {
    const classNames = tx('inset-y-3');
    expect(classNames).toStrictEqual('inset-y-3');
    expect(stringify(tw.target)).toStrictEqual('.inset-y-3{top:0.75rem;bottom:0.75rem}');
  });

  it('Negative Inset Y', () => {
    const classNames = tx('-inset-y-3');
    expect(classNames).toStrictEqual('-inset-y-3');
    expect(stringify(tw.target)).toStrictEqual(
      '.-inset-y-3{top:calc(0.75rem * -1);bottom:calc(0.75rem * -1)}',
    );
  });

  it('Negative Inset X', () => {
    const classNames = tx('-inset-x-3');
    expect(classNames).toStrictEqual('-inset-x-3');

    expect(stringify(tw.target)).toStrictEqual(
      '.-inset-x-3{right:calc(0.75rem * -1);left:calc(0.75rem * -1)}',
    );
  });

  it('Inset X', () => {
    const classNames = tx('inset-x-3');
    expect(classNames).toStrictEqual('inset-x-3');
    expect(stringify(tw.target)).toStrictEqual('.inset-x-3{right:0.75rem;left:0.75rem}');
  });
});

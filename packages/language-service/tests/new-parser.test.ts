import { describe, expect, it } from 'vitest';
import { testNewParser } from '../src/internal/parsers/TwinParser.runner';

describe('new parser', () => {
  it('parse normal', () => {
    const result = testNewParser('flex-1 bg-green-200 md:bg-red');

    expect(result.composedClasses.length).toBeGreaterThan(0);
  });

  it('parse group', () => {
    const result = testNewParser('text(green xl)');

    expect(result.composedClasses.length).toBeGreaterThan(0);
  });

  it('parse complex', () => {
    const result = testNewParser('text(green xl md:sm caps sm:md:(2xl))');

    expect(result.composedClasses.length).toBeGreaterThan(0);
  });

  it('parse loose', () => {
    const result = testNewParser('text(green xl md:(5xl) caps sm:md:(2xl');

    expect(result.composedClasses.length).toBeGreaterThan(0);
  });
});

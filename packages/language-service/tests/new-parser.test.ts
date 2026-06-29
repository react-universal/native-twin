import { describe, expect, it } from 'vitest';
import { runTwinParser } from '../src/internal/parsers/TwinParser.runner';

describe('new parser', () => {
  it('parse normal', () => {
    const result = runTwinParser({ startOffset: 0, text: 'flex-1 bg-green-200 md:bg-red' });

    expect(result.result.length).toBeGreaterThan(0);
  });

  it('parse group', () => {
    const result = runTwinParser({ startOffset: 0, text: 'text(green xl)' });

    expect(result.result.length).toBeGreaterThan(0);
  });

  it('parse complex', () => {
    const result = runTwinParser({ startOffset: 0, text: 'text(green xl md:sm caps sm:md:(2xl))' });

    expect(result.result.length).toBeGreaterThan(0);
  });

  it('parse loose', () => {
    const result = runTwinParser({
      startOffset: 0,
      text: 'text(green xl md:(5xl) caps sm:md:(2xl',
    });

    expect(result.result.length).toBeGreaterThan(0);
  });
});

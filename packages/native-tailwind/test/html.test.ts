import { describe, expect, it } from 'vitest';
import { defineConfig, extract, install, tw } from '../src';

install(defineConfig({}));

const html1 = `<html><head></head><body class="min-h-screen min-w-full"><div class="bg-blue-200" /></body>`;
const html2 = `<html><head></head><body class="min-h-screen min-w-full"><div class="bg-red-200" /></body>`;

describe('@universal-labs/native-tw - TW call', () => {
  it('Insert rules', () => {
    const result = extract(html1, tw);
    // console.log('EXTRACTED_1: ', result.css);
    expect(result.css).toStrictEqual(
      '.min-h-screen{min-height:100vh;}\n' +
        '.min-w-full{min-width:100%;}\n' +
        '.bg-blue-200{background-color:rgba(191,219,254,1);}',
    );
    const result2 = extract(html2, tw);
    // console.log('EXTRACTED_2: ', result2.css);
    expect(result2.css).toStrictEqual('.bg-red-200{background-color:rgba(254,202,202,1);}');
  });
});

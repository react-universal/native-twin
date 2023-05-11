import { describe, expect, it } from 'vitest';
import { CssTokenizer } from '../src/runtime/parser/CssParser';

const cssRuleProgram =
  '/*!dbgidc,w,bg-black*/.bg-black{--tw-bg-opacity:1;background-color:rgba(0,0,0,var(--tw-bg-opacity));}';

describe('@universal-labs/stylesheets', () => {
  it('Parse CSS comments', () => {
    const tokenizer = new CssTokenizer(cssRuleProgram);

    // console.log(
    //   'parsingResult: ',
    //   util.inspect(tokenizer.ast, false, null, true /* enable colors */),
    // );
    expect(tokenizer.ast).toMatchObject({
      isError: false,
      error: null,
      index: 101,
      targetString: cssRuleProgram,
      result: {
        value: {
          comments: { value: 'dbgidc,w,bg-black', type: 'comment' },
          selector: { value: 'bg-black', type: 'selector' },
          declarations: {
            value: '--tw-bg-opacity:1;background-color:rgba(0,0,0,var(--tw-bg-opacity));',
            type: 'declarations',
          },
        },
        type: 'rule',
      },
    });
  });
});

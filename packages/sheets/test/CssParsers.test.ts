/* eslint-disable no-console */
import { initialize, stringify } from '@universal-labs/twind-adapter';
import util from 'util';
import { describe, expect, it } from 'vitest';
import { CssTokenizer } from '../src/runtime/parser/CssParser';
import { matchCssComment } from '../src/runtime/parser/combinator/comments';
import { matchCssDeclarations } from '../src/runtime/parser/combinator/declarations';
import { matchCssSelector } from '../src/runtime/parser/combinator/selector';
import { matchMany } from '../src/runtime/parser/composers/many';
import { matchSequenceOf } from '../src/runtime/parser/composers/sequence';

const { tx, tw } = initialize();

const cssRuleProgram =
  '/*!dbgidc,w,bg-black*/.bg-black{--tw-bg-opacity:1;background-color:rgba(0,0,0,var(--tw-bg-opacity));}';
const cssNestedRuleProgram =
  '/*!efvri8,w,hover:ios:bg-pink-600*/@media (min-width:&:ios){.hover:ios:bg-pink-600:hover{--tw-bg-opacity:1;background-color:rgba(219,39,119,var(--tw-bg-opacity))}}';

describe('@universal-labs/stylesheets', () => {
  it('Parse CSS Rule', () => {
    const tokenizer = new CssTokenizer(cssRuleProgram);

    console.log(
      'tokenizer.ast: ',
      util.inspect(tokenizer.ast, false, null, true /* enable colors */),
    );

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

  it('Parse CSS Nested Rule', () => {
    /*
      TOKENS:
      ATRULE -> initialize rule with @ symbol
      (not|only) -> not or only keyword (optional)
      (print|screen|speech|all) -> media type (optional)
      (and|or) -> media query combinator (optional)
      (mediaFeature) -> media query expression (optional)
    */
    tx('ios:(bg-black text-white) hover:(bg-pink-600) flex-1');
    const css = stringify(tw.target);
    const fullRuleMatch = matchMany(
      matchSequenceOf([matchCssComment, matchCssSelector, matchCssDeclarations]),
    );
    console.log('CSS: ', css);
    const parsingNestedResult = fullRuleMatch.run(css);

    console.log(
      'parsingNestedResult: ',
      util.inspect(parsingNestedResult, false, null, true /* enable colors */),
    );

    expect(parsingNestedResult.result).toMatchObject({
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

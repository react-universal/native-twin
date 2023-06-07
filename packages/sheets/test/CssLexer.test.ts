import { initialize } from '@universal-labs/twind-adapter';
import { describe, expect, it } from 'vitest';
import { pipe } from '../src/parser/pipe.composer';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  it('CSS Combinators', () => {
    tx('text-2xl');
    const css = tw.target.join('');

    const getSelector = (css: string): ParserState[] => {
      const input = css;
      if (input.charAt(0) === '.') {
        const indexOfEnd = input.indexOf('{');
        return [[css.slice(0, indexOfEnd), css.slice(indexOfEnd)]];
      } else {
        return [['', css]];
      }
    };

    const getRule = (css: ParserState[]): ParserState[] => {
      const input = css[0]![1];
      if (input.charAt(0) === '{') {
        const indexOfEnd = input.indexOf('}') + 1;
        return [...css, [input.slice(1, indexOfEnd - 1), input.slice(indexOfEnd)]];
      } else {
        return [...css, ['', input]];
      }
    };

    // let cssList: List<any> = nil;
    // const result = getSelector(css);
    // cssList = cons(result, cssList);
    // console.log('CSS_LIST; ', cssList);

    const rule = pipe(css, getSelector, getRule);
    expect(rule).toStrictEqual([
      ['.text-2xl', '{font-size:1.5rem;line-height:2rem}'],
      ['font-size:1.5rem;line-height:2rem', ''],
    ]);
  });
});

type ParserState = [string, string];

// const concatAllWithMonoID =
//       <A>(m: MonoID<A>) =>
//       (xs: List<A>): A =>
//         matchList(
//           () => m.empty,
//           (head: A, tail: List<A>) => {
//             return m.concat(head, concatAllWithMonoID(m)(tail));
//           },
//         )(xs);

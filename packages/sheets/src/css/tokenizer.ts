import { Platform } from 'react-native';
import { parseCssString } from '@universal-labs/css';
import type { AnyStyle, Context } from './css.types';

const platformMatch = /web|ios|android|native+/;

const createTokenizer = () => {
  // const cache = new Map<string, CssRuleNode | CssAtRuleNode>();

  return (target: string[], context: Context) => {
    // const sheetNode: CssSheetNode = {
    //   type: 'sheet',
    //   rules: [],
    // };
    const purged = target.filter((item) =>
      platformMatch.test(item) ? item.includes(Platform.OS) : true,
    );

    // const parseNextRule = (current: string) => {
    //   if (cache.has(current)) {
    //     const seen = cache.get(current)!;
    //     sheetNode.rules.push(seen);
    //   } else {
    //     const nextRule = parseCssString(current, context);
    //     console.log('STYLES: ');
    //     // cache.set(current, nextRule.value);
    //   }
    // };
    const data = purged.reduce(
      (prev, current) => {
        // console.log('SHEET: ', current);
        const nextStyle = parseCssString(current, {
          deviceHeight: context.deviceHeight,
          deviceWidth: context.deviceWidth,
          rem: context.units.rem,
        });
        prev[nextStyle[0]] = {
          ...prev[nextStyle[0]],
          ...nextStyle[1],
        };
        // console.log('CSS: ', current);
        return prev;
      },
      {
        base: {} as AnyStyle,
        even: {} as AnyStyle,
        first: {} as AnyStyle,
        group: {} as AnyStyle,
        last: {} as AnyStyle,
        odd: {} as AnyStyle,
        pointer: {} as AnyStyle,
      },
    );

    // console.log('RESULT: ', data);
    // console.log('AS_BASE: ', JSON.stringify(data.base, null, 2));

    return data;
  };
};

export const evaluateTwUtilities = createTokenizer();

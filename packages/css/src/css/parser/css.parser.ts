import * as P from '@native-twin/arc-parser';
import { AnyStyle } from '../../react-native/rn.types';
import { CssParserData } from './css-parser.types';
import { ParseCssRules } from './rules.parser';

export const CreateCssResolver = () => {
  const cache = new Map<string, AnyStyle>();

  return function interpreter(target: string[], context: CssParserData['context']) {
    const fullCss = target.join('');
    const parseFull = parseCssTarget(fullCss, context);
    return parseFull;
  };

  function parseCssTarget(target: string, context: CssParserData['context']) {
    const parsed = P.withData(ParseCssRules)({
      cache: {
        get: getCacheForSelector,
        set: setCacheForSelector,
      },
      context,
      styles: {},
    }).run(target);

    return parsed.data.styles;
  }

  function getCacheForSelector(selector: string) {
    if (cache.has(selector)) {
      return cache.get(selector)!;
    }
    return null;
  }

  function setCacheForSelector(selector: string, style: AnyStyle) {
    cache.set(selector, style);
  }
};

export const CssResolver = CreateCssResolver();

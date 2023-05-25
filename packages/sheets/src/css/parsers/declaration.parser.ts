import type { Context, PartialStyle, Style } from '../css.types';
import { replaceCSSValueVariables } from '../helpers';
import { createMedia } from './mediaQueries';
import { cssDeclarationParser } from './property.parser';

function cssToStyle(css: string) {
  const result: Style = {};
  // Find media queries (We use [\s\S] instead of . because dotall flag (s) is not supported by react-native-windows)
  const cssWithoutMediaQueries = css.replace(/@media([\s\S]*?){[^{}]*}/gim, (res) => {
    const { css, isValid } = createMedia(res);
    if (!css) {
      result.media = [];
      return '';
    }
    const style = cssChunkToStyle(css);
    const mediaQuery = (context: Context) => isValid(context) && style;
    if (!result.media) result.media = [];
    result.media!.push(mediaQuery);
    return '';
  });
  // Find hover (we don't support hover within media queries) (We use [\s\S] instead of . because dotall flag (s) is not supported by react-native-windows)
  const cssWithoutHover = cssWithoutMediaQueries.replace(
    /&:hover\s*{([\s\S]*?)}/gim,
    (res) => {
      const hoverInstructions = res.substring(0, res.length - 1).replace(/&:hover\s*{/im, ''); // We remove the `&:hover {` and `}`
      result.hover = cssChunkToStyle(hoverInstructions);
      return '';
    },
  );
  Object.assign(result, cssChunkToStyle(cssWithoutHover));
  return result;
}

function cssChunkToStyle(css: string) {
  const result: PartialStyle = {};
  const variables: Record<string, string> = {};
  css.split(/\s*;\s*(?!base64)/gm).forEach((entry: string) => {
    const [rawProperty, ...rest] = entry.split(':');
    let rawValue = rest.join(':');
    if (rawProperty && rawValue && entry) {
      if (rawProperty.startsWith('--')) {
        Object.assign(variables, { [rawProperty]: rawValue });
        variables[rawProperty] = rawValue;
        return;
      }
      if (rawValue.includes('var(')) {
        rawValue = replaceCSSValueVariables(rawValue, variables);
      }
      const transformed = cssDeclarationParser(rawProperty, rawValue);
      Object.assign(result, transformed);
    }
  });
  return result;
}

export { cssToStyle };

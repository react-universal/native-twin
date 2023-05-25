import type { Context, Style, Transform } from './css.types';
import { cssToStyle } from './parsers/declaration.parser';
import { calculate } from './parsers/maths';
import { isNumber } from './parsers/numbers';

export const parseDeclarations = (input: string, context: Context) => {
  const styles = cssStyleToRN(cssToStyle(input), context);
  return styles;
};

const cssStyleToRN = (cssStyle: Style, context: Context) => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(cssStyle)) {
    if (typeof value === 'string') {
      if (value.endsWith('px')) {
        result[key] = parseFloat(value.slice(0, -2));
      } else if (value.endsWith('rem') || value.endsWith('em')) {
        result[key] = parseFloat(value) * context.units.rem;
      } else if (value.endsWith('vw')) {
        result[key] = context.units.width! * (parseFloat(value) / 100);
      } else if (value.endsWith('vh')) {
        result[key] = context.units.height! * (parseFloat(value) / 100);
      } else if (value.endsWith('%')) {
        result[key] = value;
        continue;
      } else if (isNumber(value)) {
        if (value.startsWith('calc(')) {
          result[key] = calculate(value.trim().slice(4), context);
        } else {
          result[key] = parseFloat(value);
        }
      } else {
        result[key] = value;
      }
    } else if (key === 'transform') {
      const transform = (value as Transform[]).map((v) => cssStyleToRN(v, context));
      result[key] = transform;
    } else {
      result[key] = value;
    }
  }
  return result as any as Style;
};

import type { CssParserData } from '../types/parser.types';
import { ParseCssRules } from './rules.parser';

export const CreateCssResolver = () => {
  const parseCssTarget = (target: string, context: CssParserData['context']) => {
    const parsed = ParseCssRules.run(target, context);
    return parsed;
  };

  return function interpreter(target: string[], context: CssParserData['context']) {
    const fullCss = target.join('');
    const parseFull = parseCssTarget(fullCss, context);
    return parseFull;
  };
};

export const CssResolver = CreateCssResolver();

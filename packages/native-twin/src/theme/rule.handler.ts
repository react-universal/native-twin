import type { TWParsedRule, SheetEntry, SheetEntryDeclaration } from '@universal-labs/css';
import { createRuleResolver } from '../parsers/rule-handler';
import type { Rule, ThemeContext } from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';

export function createRuleController<Theme extends __Theme__ = __Theme__>(
  themeRule: Rule<Theme>,
) {
  const resolver = createRuleResolver(themeRule);
  const vars = new Set<string>();
  const declarations: SheetEntryDeclaration[] = [];
  const additionalEntries: SheetEntry[] = [];
  return {
    resolveRule(token: TWParsedRule, ctx: ThemeContext<Theme>) {
      return resolver(token, ctx);
    },
    addCssVar(name: string, value: string) {
      vars.add(`${name}=${value}`);
    },
    addDeclaration(value: SheetEntryDeclaration) {
      declarations.push(value);
    },
    addExtraEntry(value: SheetEntry) {
      additionalEntries.push(value);
    },
    selector() {
      return '';
    },
  };
}

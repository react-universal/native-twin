import { matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import type { __Theme__ } from '@universal-labs/native-twin';

export const boxShadowRules: Rule<__Theme__>[] = [
  matchThemeValue('shadow-', 'boxShadow', 'shadowRadius'),
];

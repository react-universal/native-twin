import { matchThemeColor } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import type { __Theme__ } from '@universal-labs/native-twin';

export const backgroundRules: Rule<__Theme__>[] = [matchThemeColor('bg-', 'backgroundColor')];

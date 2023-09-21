import type { __Theme__ } from '../../types/theme.types';
import { ringBase } from '../tailwind-rules';

export const preflightBase = {
  ...ringBase,
} satisfies __Theme__['preflightBase'];

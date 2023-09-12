import type { __Theme__ } from '../../types/theme.types';
import { boxShadowsBase, ringBase, transformBase } from '../tailwind-rules';

export const preflightBase = {
  ...transformBase,
  ...boxShadowsBase,
  ...ringBase,
} satisfies __Theme__['preflightBase'];

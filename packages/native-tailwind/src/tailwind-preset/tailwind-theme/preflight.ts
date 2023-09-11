import { boxShadowsBase, ringBase, transformBase } from '../tailwind-rules';
import type { __Theme__ } from '../../config/theme-types';

export const preflightBase = {
  ...transformBase,
  ...boxShadowsBase,
  ...ringBase,
} satisfies __Theme__['preflightBase'];

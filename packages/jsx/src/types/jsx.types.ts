import type React from 'react';

export interface JSXInternalProps extends Record<string, any> {
  twEnabled?: boolean;
}

export type JSXFunction = (
  type: React.ComponentType,
  props: JSXInternalProps | undefined | null,
  key?: React.Key,
  isStaticChildren?: boolean,
  __source?: unknown,
  __self?: unknown,
) => React.ElementType;

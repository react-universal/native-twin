import type React from 'react';
import type { RegisteredComponent, RuntimeSheetEntry } from '@native-twin/css/jsx';

export interface JSXInternalProps extends Record<string, any> {
  twEnabled?: boolean;
  _twinComponentID?: string;
  _twinComponentSheet: RegisteredComponent;
  _twinComponentTemplateEntries: ComponentTemplateEntryProp[];
}

export type JSXFunction = (
  type: React.ComponentType,
  props: JSXInternalProps | undefined | null,
  key?: React.Key,
  isStaticChildren?: boolean,
  __source?: unknown,
  __self?: unknown,
) => React.ElementType;

export interface ComponentTemplateEntryProp {
  id: string;
  prop: string;
  target: string;
  entries: RuntimeSheetEntry[];
}

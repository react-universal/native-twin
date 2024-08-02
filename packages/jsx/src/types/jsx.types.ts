import type React from 'react';
import { SheetEntry } from '@native-twin/css';
import { RegisteredComponent } from '@native-twin/css/jsx';

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

export interface BabelStyledProps {
  prop: string;
  target: string;
  entries: SheetEntry[];
  templateLiteral?: string;
}

export interface ComponentTemplateEntryProp {
  id: string;
  prop: string;
  target: string;
  entries: SheetEntry[];
}

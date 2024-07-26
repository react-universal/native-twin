import type React from 'react';
import { SheetEntry } from '@native-twin/css';
import { RegisteredComponent } from '../sheet/sheet.types';

export interface JSXInternalProps extends Record<string, any> {
  twEnabled?: boolean;
  _twinComponentID?: string;
  _twinComponentSheet: RegisteredComponent;
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

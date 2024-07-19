import type { Binding } from '@babel/traverse';
import * as t from '@babel/types';
import type { Option } from 'effect';
import type { SheetEntry } from '@native-twin/css';
import { ComponentSheet } from '@native-twin/jsx/build/sheet/sheet.types';
import type { MappedComponent } from '../utils/component.maps';

export type JSXChildElement = t.JSXElement['children'][number];
export type AnyPrimitive = string | number | boolean;

export type MapChildFn = (child: t.JSXElement) => t.JSXElement;
export type MapAttributeFn = (attribute: t.JSXAttribute) => t.JSXAttribute;

export interface JSXElementHandler {
  openingElement: JSXOpeningElementHandler;
  childrenCount: number;
  mutateChilds: (fn: MapChildFn) => void;
  getBinding: () => Option.Option<Binding>;
  isReactNativeImport: () => boolean;
}

export interface JSXOpeningElementHandler {
  openingElement: t.JSXOpeningElement,
  getElementName: () => Option.Option<string>;
  getElementConfig: () => Option.Option<MappedComponent>;
  mutateAttributes: (fn: MapAttributeFn) => void;
  getAttributes: () => t.JSXAttribute[];
  isSelfClosed: () => boolean;
  extractClassNames: () => JSXMappedAttribute[];
  addStyledProp: (id: string, prop: StyledPropEntries) => void;
  styledPropsToObject(classProps: StyledPropEntries): [string, RuntimeComponentEntry];
}

export interface JSXMappedAttribute {
  prop: string;
  value: t.StringLiteral | t.TemplateLiteral;
  target: string;
}

export interface StyledPropEntries {
  entries: SheetEntry[];
  prop: string;
  target: string;
  expression: t.TemplateLiteral | null;
  classNames: string;
}
export interface RuntimeComponentEntry {
  prop: string;
  target: string;
  entries: SheetEntry[];
  metadata: ComponentSheet['metadata'];
}

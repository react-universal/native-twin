import type {
  Identifier,
  JsxOpeningElement,
  JsxElement,
  JsxSelfClosingElement,
  NoSubstitutionTemplateLiteral,
  StringLiteral,
  TemplateExpression,
  CallExpression,
} from 'ts-morph';
import type {
  RuntimeComponentEntry,
  SheetGroupEntries,
} from '../sheet/sheet.types';
import type { MappedComponent } from '../utils';

export type AnyPrimitive = string | number | boolean;
export type ValidJSXElementNode = JsxElement | JsxSelfClosingElement;
export type ValidOpeningElementNode = JsxOpeningElement | JsxSelfClosingElement;

export type ValidJSXClassnameTemplate =
  | TemplateExpression
  | NoSubstitutionTemplateLiteral;

export type ValidJSXClassnameNodeString =
  | StringLiteral
  | ValidJSXClassnameTemplate
  | Identifier
  | CallExpression;

export interface JSXClassnameStrings {
  templates: string | null;
  literal: string;
}

/** @domain TypeScript Transform */
export interface JSXMappedAttribute {
  prop: string;
  value: {
    literal: string;
    templates: string | null;
  };
  target: string;
}

interface ComponentStyles {
  styledProp: string;
  templateEntries: string;
}
export const componentStylesZero: ComponentStyles = {
  styledProp: '',
  templateEntries: '',
};

export interface ResultComponent {
  // styles: ComponentStyles;
  mappedClassNames: JSXMappedAttribute[];
  jsxElement: JsxElement | JsxSelfClosingElement;
  // importDeclaration: ts.ImportDeclaration;
  openingElement: JsxSelfClosingElement | JsxOpeningElement;
  tagName: Identifier;
  order: number;
  childComponents: ResultComponent[];
  childRuntimeEntries: SheetGroupEntries;
  runtimeEntries: RuntimeComponentEntry[];
  styledConfig: MappedComponent;
  childsCount: number;
  componentID: string;
  parentID: string | undefined;
}

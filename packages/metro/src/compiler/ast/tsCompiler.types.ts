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


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

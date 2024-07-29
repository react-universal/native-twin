import type {
  Identifier,
  JsxOpeningElement,
  ts,
  JsxElement,
  JsxSelfClosingElement,
  NoSubstitutionTemplateLiteral,
  StringLiteral,
  TemplateExpression,
} from 'ts-morph';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import type { MappedComponent } from '../utils';

export type ValidJSXElementNode = JsxElement | JsxSelfClosingElement;
export type ValidOpeningElementNode = JsxOpeningElement | JsxSelfClosingElement;

export type ValidJSXClassnameTemplate =
  | TemplateExpression
  | NoSubstitutionTemplateLiteral;

export type ValidJSXClassnameNodeString = StringLiteral | ValidJSXClassnameTemplate;

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
  rawEntries: {
    styledProp: string;
    templateEntries: string;
  };
  entries: RuntimeComponentEntry[];
}
export const componentStylesZero: ComponentStyles = {
  rawEntries: {
    styledProp: '',
    templateEntries: '',
  },
  entries: [],
};
export interface ResultComponent {
  styles: ComponentStyles;
  elementNode: {
    jsxElement: JsxElement | JsxSelfClosingElement;
    importDeclaration: ts.ImportDeclaration;
    openingElement: JsxSelfClosingElement | JsxOpeningElement;
    componentEntries: JSXMappedAttribute[];
    tagName: Identifier;
    styledConfig: MappedComponent;
  };
}

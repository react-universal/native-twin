import type {
  Identifier,
  JsxOpeningElement,
  ts,
  JsxElement,
  JsxSelfClosingElement,
} from 'ts-morph';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import type { MappedComponent } from '../utils';

export type ValidJSXElementNode = JsxElement | JsxSelfClosingElement;

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
    tagName: Identifier;
    importDeclaration: ts.ImportDeclaration;
    openingElement: JsxSelfClosingElement | JsxOpeningElement;
    attributes: {
      classNames: JSXMappedAttribute[];
      tagName: Identifier;
      componentConfig: MappedComponent;
    };
  };
}

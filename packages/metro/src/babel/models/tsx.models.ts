import * as Data from 'effect/Data';
import type {
  JsxElement,
  NoSubstitutionTemplateLiteral,
  StringLiteral,
  TemplateExpression,
} from 'ts-morph';
import { SyntaxKind } from 'ts-morph';
import type { RuntimeTW } from '@native-twin/core';
import { cx } from '@native-twin/core';
import type { MappedComponent } from '../../utils/component.maps';

/** @domain TypeScript Transform */
export interface JSXMappedAttribute {
  prop: string;
  value: StringLiteral | TemplateExpression | NoSubstitutionTemplateLiteral;
  target: string;
}

/** @domain TypeScript */
export class JSXElementNode extends Data.Class<{
  element: JsxElement;
  readonly tagName: string;
  readonly classNames: JSXMappedAttribute[];
  readonly componentConfig: MappedComponent;
  readonly filename: string;
  readonly order: number;
}> {
  // MARK: - Computed properties
  get openingElement() {
    return this.element.getOpeningElement();
  }

  get classNamesString() {
    return this.classNames.map(({ value }) => {
      if (value.isKind(SyntaxKind.StringLiteral)) {
        return value.compilerNode.getText();
      }
      if (value.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
        return value.compilerNode.text;
      }
      const head = value.getHead();
      const spans = value.getTemplateSpans();
      const cooked = cx`${head.compilerNode.text.replace(/\n\s+/g, ' ').trim()}`;
      const cookedSpans = spans.map((x) => x.compilerNode.expression.getText());
      const result = `${cooked} \${${cookedSpans}}`;
      return result;
    });
  }

  compileClassNames(tw: RuntimeTW) {
    return tw(`${this.classNamesString}`);
  }

  // MARK: - Functions
}

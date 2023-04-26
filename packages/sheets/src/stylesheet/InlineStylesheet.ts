import { StyleSheet } from 'react-native';
import {
  normalizeClassNameString,
  setTailwindConfig as setTwindConfig,
  transformClassNames,
} from '@universal-labs/twind-native';
import transform from 'css-to-react-native';
import cssTree from 'css-tree';
import type { Config } from 'tailwindcss';
import type { AnyStyle, GeneratedComponentsStyleSheet } from '../types';
import { generateComponentHashID } from '../utils/hash';
import { extractCSSStyles } from '../utils/helpers';
import { classNamesToArray } from '../utils/splitClasses';

export function setTailwindConfig(config: Config, baseRem = 16) {
  setTwindConfig(
    {
      colors: {
        ...config.theme?.colors,
        ...config.theme?.extend?.colors,
      },
      fontFamily: { ...config.theme?.extend?.fontFamily },
    },
    baseRem,
  );
}

export const generatedComponentStylesheets: GeneratedComponentsStyleSheet = {};

export default class InlineStyleSheet {
  id: string;
  originalClasses: readonly string[];

  metadata = {
    parentID: '',
    groupID: '',
    isFirstChild: false,
    isLastChild: false,
    nthChild: -1,
    isGroupParent: false,
    hasPointerEvents: false,
    hasGroupEvents: false,
  };

  styles: {
    base: AnyStyle;
    pointerStyles: AnyStyle;
    first: AnyStyle;
    last: AnyStyle;
    even: AnyStyle;
    odd: AnyStyle;
    group: AnyStyle;
  };

  constructor(public classNames?: string) {
    const splittedClasses = classNamesToArray(this.classNames);
    this.originalClasses = Object.freeze(splittedClasses);
    this.id = generateComponentHashID(this.originalClasses.join(' ') ?? 'unstyled');
    if (this.originalClasses.includes('group')) {
      this.metadata.isGroupParent = true;
    }
    const transformedClasses = transformClassNames(splittedClasses.join(' '));
    // const base: [string, string][] = [];
    // const group: [string, string][] = [];
    const ast = cssTree.parse(transformedClasses.css, {
      parseRulePrelude: false,
    });
    const rules = cssTree.findAll(ast, (node) => {
      if (
        node.type === 'Rule' &&
        node.prelude.type === 'Raw' &&
        splittedClasses.includes(normalizeClassNameString(node.prelude.value))
      ) {
        // console.debug('prelude', node.prelude);
        return true;
      }
      if (node.type === 'Rule' && node.prelude.type === 'Raw') {
        if (node.prelude.value.includes(':')) {
          this.metadata.hasPointerEvents =
            node.prelude.value.includes('.focus') ||
            node.prelude.value.includes('.hover') ||
            node.prelude.value.includes('.active');
          this.metadata.hasGroupEvents =
            node.prelude.value.includes('.group-focus') ||
            node.prelude.value.includes('.group-hover') ||
            node.prelude.value.includes('.group-active');
          return true;
        }
      }
      return false;
    });
    const results = {
      declarations: [] as [string, string, string][],
    };
    for (const rule of rules) {
      const result = extractCSSStyles(rule);
      results.declarations.push(...result.declarations);
    }

    const baseDeclarations = results.declarations
      .filter((item) => !item[0].includes(':'))
      .map((item) => {
        return transform([[item[1], item[2]]]);
      });
    const pseudoDeclarations = results.declarations
      .filter((item) => item[0].includes(':'))
      .map((item) => {
        return transform([[item[0], item[1]]]);
      });
    // console.log('baseDeclarations', results);
    this.getChildStyles = this.getChildStyles.bind(this);
    // const baseStyles: AnyStyle[] = [];
    // const pointerStyles: AnyStyle[] = [];
    const groupStyles: AnyStyle[] = [];
    // const platformStyles: AnyStyle[] = [];
    const childStyles = {
      first: [] as AnyStyle[],
      last: [] as AnyStyle[],
      even: [] as AnyStyle[],
      odd: [] as AnyStyle[],
    };
    // @ts-expect-error
    this.styles = StyleSheet.create({
      // @ts-expect-error
      base: StyleSheet.flatten(baseDeclarations),
      // @ts-expect-error
      pointerStyles: StyleSheet.flatten(pseudoDeclarations),
      first: StyleSheet.flatten(childStyles.first),
      last: StyleSheet.flatten(childStyles.last),
      even: StyleSheet.flatten(childStyles.even),
      odd: StyleSheet.flatten(childStyles.odd),
      group: StyleSheet.flatten(groupStyles),
    });
    generatedComponentStylesheets[this.id] = this.styles;
  }

  getStyles() {
    return generatedComponentStylesheets[this.id]!;
  }

  public getChildStyles(input: {
    isFirstChild: boolean;
    isLastChild: boolean;
    isEven: boolean;
    isOdd: boolean;
  }) {
    const result: AnyStyle = {};
    const styleSheet = generatedComponentStylesheets[this.id];
    if (styleSheet) {
      if (input.isFirstChild) {
        Object.assign(result, styleSheet.first);
      }
      if (input.isLastChild) {
        Object.assign(result, styleSheet.last);
      }
      if (input.isEven) {
        Object.assign(result, styleSheet.even);
      }
      if (input.isOdd) {
        Object.assign(result, styleSheet.odd);
      }
    }
    return Object.freeze(result);
  }
}

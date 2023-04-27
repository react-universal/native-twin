import { Platform, StyleSheet } from 'react-native';
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
    const transformedClasses = transformClassNames(classNames ?? '');
    const splittedClasses = classNamesToArray(transformedClasses.generated);
    this.originalClasses = Object.freeze(splittedClasses);
    this.id = generateComponentHashID(this.originalClasses.join(' ') ?? 'unstyled');
    if (this.originalClasses.includes('group')) {
      this.metadata.isGroupParent = true;
    }
    const ast = cssTree.parse(transformedClasses.css, {
      parseRulePrelude: false,
    });
    const rules = cssTree.findAll(ast, (node) => {
      if (
        node.type === 'Rule' &&
        node.prelude.type === 'Raw' &&
        transformedClasses.generated.includes(normalizeClassNameString(node.prelude.value))
      ) {
        if (node.prelude.value.includes('animate')) {
          return false;
        }
        if (
          (node.prelude.value.includes('ios') ||
            node.prelude.value.includes('android') ||
            node.prelude.value.includes('web')) &&
          !node.prelude.value.includes('hover') &&
          !node.prelude.value.includes('focus') &&
          !node.prelude.value.includes('active')
        ) {
          return node.prelude.value.includes(Platform.OS);
        }
        if (!node.prelude.value.includes(':')) {
          return true;
        }
      }
      if (node.type === 'Rule' && node.prelude.type === 'Raw') {
        if (node.prelude.value.includes(':')) {
          this.metadata.hasPointerEvents =
            node.prelude.value.includes('focus') ||
            node.prelude.value.includes('hover') ||
            node.prelude.value.includes('active');
          this.metadata.hasGroupEvents =
            node.prelude.value.includes('group-focus') ||
            node.prelude.value.includes('group-hover') ||
            node.prelude.value.includes('group-active');
          if (
            node.prelude.value.includes('hover\\:ios') ||
            node.prelude.value.includes('hover\\:android') ||
            node.prelude.value.includes('hover\\:web') ||
            node.prelude.value.includes('group-hover\\:ios') ||
            node.prelude.value.includes('group-hover\\:android') ||
            node.prelude.value.includes('group-hover\\:web')
          ) {
            return node.prelude.value.includes(Platform.OS);
          }
          return true;
        }
        return true;
      }
      return false;
    });
    const results = {
      declarations: [] as [string, string, string][],
    };
    for (const rule of rules) {
      const declarations = extractCSSStyles(rule);
      results.declarations.push(...declarations);
    }

    const finalStyles = results.declarations.reduce(
      (current, next) => {
        if (
          (next[0].includes('ios') ||
            next[0].includes('android') ||
            next[0].includes('web')) &&
          !next[0].includes('hover') &&
          !next[0].includes('focus') &&
          !next[0].includes('active')
        ) {
          if (next[0].includes(Platform.OS)) {
            current.base.push(transform([[next[1], next[2]]]));
            return current;
          }
        }
        if (next[0].includes(':') && !next[0].includes('group')) {
          current.pointerStyles.push(transform([[next[1], next[2]]]));
        }
        if (next[0].includes(':') && next[0].includes('group')) {
          current.group.push(transform([[next[1], next[2]]]));
        }
        if (next[0].includes(':') && next[0].includes('odd')) {
          current.odd.push(transform([[next[1], next[2]]]));
        }
        if (next[0].includes(':') && next[0].includes('even')) {
          current.even.push(transform([[next[1], next[2]]]));
        }
        if (next[0].includes(':') && next[0].includes('first')) {
          current.first.push(transform([[next[1], next[2]]]));
        }
        if (next[0].includes(':') && next[0].includes('last')) {
          current.last.push(transform([[next[1], next[2]]]));
        }
        if (!next[0].includes(':')) {
          current.base.push(transform([[next[1], next[2]]]));
        }
        return current;
      },
      {
        base: [] as AnyStyle[],
        pointerStyles: [] as AnyStyle[],
        first: [] as AnyStyle[],
        last: [] as AnyStyle[],
        even: [] as AnyStyle[],
        odd: [] as AnyStyle[],
        group: [] as AnyStyle[],
      },
    );
    this.getChildStyles = this.getChildStyles.bind(this);
    this.styles = StyleSheet.create({
      base: StyleSheet.flatten(finalStyles.base),
      pointerStyles: StyleSheet.flatten(finalStyles.pointerStyles),
      first: StyleSheet.flatten(finalStyles.first),
      last: StyleSheet.flatten(finalStyles.last),
      even: StyleSheet.flatten(finalStyles.even),
      odd: StyleSheet.flatten(finalStyles.odd),
      group: StyleSheet.flatten(finalStyles.group),
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

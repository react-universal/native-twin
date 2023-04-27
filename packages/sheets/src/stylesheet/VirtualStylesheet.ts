import { Platform, StyleSheet } from 'react-native';
import {
  normalizeClassNameString,
  transformClassNames,
  virtualStylesheet as createVirtualStyleSheet,
} from '@universal-labs/twind-native';
import transform from 'css-to-react-native';
import cssTree from 'css-tree';
import type { AnyStyle } from '../types';
import { generateComponentHashID } from '../utils/hash';
import { extractCSSStyles } from '../utils/helpers';
import { classNamesToArray } from '../utils/splitClasses';

export class VirtualStyleSheet {
  private sheet = createVirtualStyleSheet();
  private processedClasses = new Set();
  injectUtilities(classNames?: string) {
    const transformedClasses = transformClassNames(classNames ?? '');
    const splittedClasses = classNamesToArray(transformedClasses.generated);
    const originalClasses = Object.freeze(splittedClasses);
    const classNameSetHash = generateComponentHashID(originalClasses.join(' ') ?? 'unstyled');
    const metadata = {
      isGroupParent: false,
      hasPointerEvents: false,
      hasGroupEvents: false,
    };
    if (originalClasses.includes('group')) {
      metadata.isGroupParent = true;
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
          metadata.hasPointerEvents =
            node.prelude.value.includes('focus') ||
            node.prelude.value.includes('hover') ||
            node.prelude.value.includes('active');
          metadata.hasGroupEvents =
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
    const styles = StyleSheet.create({
      base: StyleSheet.flatten(finalStyles.base),
      pointerStyles: StyleSheet.flatten(finalStyles.pointerStyles),
      first: StyleSheet.flatten(finalStyles.first),
      last: StyleSheet.flatten(finalStyles.last),
      even: StyleSheet.flatten(finalStyles.even),
      odd: StyleSheet.flatten(finalStyles.odd),
      group: StyleSheet.flatten(finalStyles.group),
    });
    return {
      styles,
      metadata,
      classNameSetHash,
      originalClasses,
    };
  }
}

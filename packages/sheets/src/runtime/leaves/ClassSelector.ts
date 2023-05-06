// @ts-nocheck
import camelize from 'fbjs/lib/camelize';

export type CSSObject = any;
export type CSSValue = any;

export function astish(css: string): CSSObject[] {
  const purged: string = !css.includes(';}') ? css.replace('}', ';}') : css;
  return astish$(purged);
}

// Based on https://github.com/cristianbote/goober/blob/master/src/core/astish.js
const newRule = / *(?:(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}))/g;

/**
 * Convert a css style string into a object
 */
function astish$(css: string): CSSObject[] {
  css = removeComments(css);

  const tree: CSSObject[] = [{}];
  const rules: CSSObject[] = [tree[0]];
  const conditions: string[] = [];
  let block: RegExpExecArray | null;

  while ((block = newRule.exec(css))) {
    // Remove the current entry
    if (block[4]) {
      tree.shift();
      conditions.shift();
    }

    if (block[3]) {
      // new nested
      conditions.unshift(block[3]);
      tree.unshift({});
      rules.push(conditions.reduce((body, condition) => ({ [condition]: body }), tree[0]));
    } else if (!block[4]) {
      // if we already have that property — start a new CSSObject
      if (tree[0][block[1]]) {
        tree.unshift({});
        rules.push(conditions.reduce((body, condition) => ({ [condition]: body }), tree[0]));
      }
      tree[0][camelize(block[1])] = block[2];
    }
  }

  // console.log(rules)
  return rules;
}

// Remove comments (multiline and single line)
function removeComments(css: string): string {
  return css.replace(/\/\*[^]*?\*\/|\s\s+|\n/gm, ' ');
}

export function interleave<Interpolations>(
  strings: TemplateStringsArray | any,
  interpolations: readonly Interpolations[],
  handle: (interpolation: Interpolations) => string,
): string {
  return interpolations.reduce(
    (result: string, interpolation, index) =>
      result + handle(interpolation) + strings[index + 1],
    strings[0],
  );
}

import { normalize } from '@twind/core';
import * as cssTree from 'css-tree';
import { describe, expect, it } from 'vitest';
import { setTailwindConfig, tx, tw, stringify, escape } from '../src';
import { normalizeClassNameString } from '../src/utils/helpers';

setTailwindConfig({
  fontFamily: {
    DEFAULT: 'Inter-Regular',
    inter: 'Inter-Regular',
    'inter-bold': 'Inter-Bold',
    'inter-medium': 'Inter-Medium',
    sans: 'Inter-Regular',
  },
});

describe('Inject geenric alias style', () => {
  it('Get Alias hash', () => {
    const hashAlias = tx`@~(text-2xl leading-6)`;
    expect(hashAlias).toStrictEqual('@#1f9xcy0');
  });

  it('Inject named styled', () => {
    const hashNamed = tx`Text~(text-2xl leading-6)`;
    expect(hashNamed).toStrictEqual('Text#1xrho2');
  });

  it('Check injected named styled', () => {
    const sheet = stringify(tw.target);
    const css = cssTree.parse(sheet);
    const classHash = cssTree.walk(css, {
      visit: 'ClassSelector',
      enter(node) {
        if (normalizeClassNameString(node.name) === 'Text#1xrho2') {
          console.debug('FOUND: ', this.rule?.block.children.toJSON());
        }
      },
    });
    console.log('classHash', classHash);
    expect(classHash).toStrictEqual('Text#1xrho2');
  });

  it('Parse Sheet', () => {
    const sheet = stringify(tw.target);
    const css = cssTree.parse(sheet);
    // console.log('CSS: ', sheet);
    const nodes = cssTree.findAll(css, (node) => {
      if (node.type === 'SelectorList') {
        // console.log('SELECTOR_LIST: ', node.children);
        const finds = node.children.filter((child) => {
          if (child.type === 'Selector') {
            // console.log('CHILDREN: ', child.children);
            if (child.children.first) {
              if (child.children.first.type === 'ClassSelector') {
                const name = child.children.first?.name;
                if (name && normalizeClassNameString(name) === 'Text#1xrho2') {
                  // console.log('YOU FUCKING DID IT !');
                  return true;
                }
              }
            }
          }
        });
        return finds;
      }
      return false;
    });
    // console.log('FINDED: ', JSON.stringify(nodes, null, 2));
    const object = cssTree.toPlainObject(css);
    // const matchProp = new cssTree.Lexer().matchProperty('font-family', css);
    // console.log('MATCH_PROP: ', matchProp);
    // console.log('CSS_OBJECT: ', JSON.stringify(object, null, 2));
    // console.log('SHEET: ', sheet);
    expect(object).toBe('Selector');
  });
});

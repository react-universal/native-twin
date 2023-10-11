import { escapeSelector, toColorValue, toHyphenCase } from '@universal-labs/css';
import type { SheetEntry, SheetEntryDeclaration } from '../types/css.types';
import { asArray } from '../utils/helpers';

export function sheetEntriesToCss(entries: SheetEntry[] | SheetEntry): string {
  return asArray(entries)
    .filter(Boolean)
    .map((x) => {
      return getEntryRuleBlock(x);
    })
    .join('\n');
}

export function getEntryRuleBlock(entry: SheetEntry) {
  let className = `.${escapeSelector(entry.className)}`;
  const atRules: string[] = [];
  const declarations = sheetEntryDeclarationsToCss(entry.declarations, entry.important);
  for (const condition of entry.selectors) {
    // Media query
    if (condition.startsWith('@') && condition[1] == 'm') {
      atRules.push(condition);
      continue;
    }
    // Pseudo
    if (condition.startsWith('&')) {
      className += condition.replace('&', '');
    }

    if (condition.endsWith('&')) {
      className = `${condition.replace('&', '')}${className}`;
    }
  }
  return atRules.reduce((prev, current) => {
    return `${current}{${prev}}`;
  }, `${className}{${declarations}}`);
}

export function sheetEntryDeclarationsToCss(
  decls: SheetEntryDeclaration[],
  important = false,
) {
  if (!decls) return '';
  const body: [string, string][] = [];
  for (const d of decls) {
    if (typeof d.value == 'object' && !Array.isArray(d.value)) {
      if (d.prop === 'shadowRadius') {
        body.push([
          'boxShadow',
          `${d.value.shadowOffset?.width ?? 0}px ${d.value.shadowOffset?.height ?? 1}px ${
            d.value.shadowRadius ?? 5
          }px ${toColorValue(String(d.value.shadowColor) ?? 'rgb(0,0,0)', {
            opacityValue: String(d.value.shadowOpacity) ?? '1',
          })}`,
        ]);
        continue;
      }
      body.push(...Object.entries(d.value));
    }
    if (Array.isArray(d.value)) {
      if (d.prop === 'transform') {
        const hasTransform = body.find((x) => x[0] === 'transform');
        const declValue = d.value.reduce((prev, current) => {
          if (current.prop === 'translate') {
            prev += `translate(${current.value}, ${current.value})`;
          }
          if (current.prop === 'translateX') {
            prev += `translateX(${current.value})`;
          }
          if (current.prop === 'translateY') {
            prev += `translateY(${current.value})`;
          }
          if (current.prop === 'skew') {
            prev += `skew(${current.value}, ${current.value})`;
          }
          if (current.prop === 'skewX') {
            prev += `skewX(${current.value}, ${current.value})`;
          }
          if (current.prop === 'skewY') {
            prev += `skewY(${current.value}, ${current.value})`;
          }
          if (current.prop === 'scale') {
            prev += `scale(${current.value})`;
          }
          if (current.prop === 'scaleX') {
            prev += `scaleX(${current.value}, ${current.value})`;
          }
          if (current.prop === 'scaleY') {
            prev += `scaleY(${current.value}, ${current.value})`;
          }
          return prev;
        }, '');
        if (hasTransform) {
          hasTransform[1] = `${hasTransform[1]} ${declValue}`;
        } else {
          body.push(['transform', declValue]);
        }
      }
    }
    if (typeof d.value == 'string') {
      body.push([d.prop, d.value]);
    }
  }
  return declarationToCss(body, important);
}

export function declarationToCss(entries: [string, string][], important = false): string {
  return entries
    .flatMap((x) => `${toHyphenCase(x[0])}:${x[1]}${important ? ' !important' : ''};`)
    .join('');
}

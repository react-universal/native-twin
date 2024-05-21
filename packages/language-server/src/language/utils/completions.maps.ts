import { Option } from 'effect';
import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver-types';
import { FinalSheet } from '@native-twin/css';
import { TwinStore } from '../../native-twin/native-twin.models';
import {
  TwinRuleWithCompletion,
  TwinVariantCompletion,
} from '../../types/native-twin.types';
import { TemplateTokenData, VscodeCompletionItem } from '../language.models';
import { compareTwinRuleWithClassName } from './completion.ap';
import { getDocumentationMarkdown } from './language.utils';

export const createCompletionEntryDetails = (
  completion: vscode.CompletionItem,
  sheetEntry: FinalSheet,
): vscode.CompletionItem => ({
  ...completion,
  documentation: {
    kind: vscode.MarkupKind.Markdown,
    value: getDocumentationMarkdown(sheetEntry),
  },
});

export const getAllCompletionRules = (
  ruleCompletions: TwinStore,
  range: vscode.Range,
) => {
  const rules = pipe(
    ruleCompletions.twinRules,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filter((x) => !x.completion.className.startsWith('-')),
    ReadonlyArray.map((y) =>
      completionRuleToEntry(y, y.order, range, y.completion.className),
    ),
  );
  return pipe(
    ruleCompletions.twinVariants,
    ReadonlyArray.fromIterable,
    ReadonlyArray.map((x) => variantCompletionToEntry(x, range, x.name)),
    ReadonlyArray.appendAll(rules),
  );
};

export const completionRulesToEntries = (
  flattenTemplateTokens: ReadonlyArray<TemplateTokenData>,
  ruleCompletions: ReadonlyArray<TwinRuleWithCompletion>,
  document: TextDocument,
) => {
  const filtered = filterTokensFromRules(flattenTemplateTokens, ruleCompletions);
  return ReadonlyArray.map(filtered, (suggestion) => {
    const { match, rule } = suggestion;
    const range = vscode.Range.create(
      document.positionAt(match.token.bodyLoc.start),
      document.positionAt(match.token.bodyLoc.end),
    );
    let insertText = rule.completion.className;
    if (match.base) {
      if (match.base.token.type === 'CLASS_NAME') {
        insertText = insertText.replace(`${match.base.token.value.n}-`, '');
      }
    }
    if (match.token.token.type === 'VARIANT') {
      insertText = `${match.token.token.value.map((x) => x.n).join(':')}:${insertText}`;
    }
    if (match.token.token.type === 'VARIANT_CLASS') {
      const variantText = `${match.token.token.value[0].value.map((x) => x.n).join(':')}:`;
      const newOffset = range.start.character + variantText.length;
      range.start.character = newOffset;
    }
    const result = completionRuleToEntry(rule, rule.order, range, insertText);
    return result;
  });
};

export const completionRuleToEntry = (
  completionRule: TwinRuleWithCompletion,
  _index: number,
  range: vscode.Range,
  insertText: string,
) => new VscodeCompletionItem(completionRule, range, insertText);

/** File private */
export const variantCompletionToEntry = (
  variant: TwinVariantCompletion,
  range: vscode.Range,
  insertText: string,
) => new VscodeCompletionItem(variant, range, insertText);

/** File private */
const filterTokensFromRules = (
  flattenTemplateTokens: ReadonlyArray<TemplateTokenData>,
  ruleCompletions: ReadonlyArray<TwinRuleWithCompletion>,
) => {
  return pipe(
    ruleCompletions,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filterMap((rule) => {
      const resolver = compareTwinRuleWithClassName(rule);
      ruleCompletions;
      const match = flattenTemplateTokens.find((x) => {
        let className = x.token.text;
        if (x.base) {
          if (x.base.token.type === 'VARIANT') {
            const variantText = `${x.base.token.value.map((x) => x.n).join(':')}:`;
            className = className.replace(variantText, '');
          }
          if (x.base.token.type === 'VARIANT_CLASS') {
            const variantText = `${x.base.token.value[0].value.map((x) => x.n).join(':')}:`;
            className = className.replace(variantText, '');
          }
        }
        if (x.token.token.type === 'VARIANT_CLASS') {
          const variantText = `${x.token.token.value[0].value.map((x) => x.n).join(':')}:`;
          className = className.replace(variantText, '');
        }
        return resolver([className]);
      });
      if (match) {
        return Option.some({ rule, match });
      }
      return Option.none();
    }),
  );
};
import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { TemplateNode, TwinDocument } from '../../documents/document.resource';
import { TwinStore } from '../../native-twin/native-twin.models';
import { TemplateTokenWithText } from '../../template/template.models';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import { getFlattenTemplateToken } from './language.utils';

export const extractTemplateAtPosition = (
  maybeDocument: Option.Option<TwinDocument>,
  position: vscode.Position,
) =>
  Option.Do.pipe(
    Option.bind('document', () => maybeDocument),
    Option.bind('templateAtPosition', ({ document }) =>
      document.getTemplateNodeAtPosition(position),
    ),
    Option.let('cursorOffset', ({ document }) => document.handler.offsetAt(position)),
    Option.let('cursorPosition', ({ document, cursorOffset }) =>
      document.handler.positionAt(cursorOffset),
    ),
    Option.let('isWhiteSpace', ({ document }) => {
      return (
        document.handler
          .getText(
            vscode.Range.create(
              {
                ...position,
                character: position.character - 1,
              },
              {
                ...position,
                character: position.character + 1,
              },
            ),
          )
          .replaceAll(/\s/g, '') === ''
      );
    }),
  );

export const extractRuleCompletionsFromTemplate = (
  template: TemplateNode,
  store: TwinStore,
) => {
  const positionTokens: TemplateTokenWithText[] = pipe(
    template.parsedNode,
    ReadonlyArray.fromIterable,
    ReadonlyArray.flatMap((x) => getFlattenTemplateToken(x)),
    ReadonlyArray.dedupe,
  );

  return pipe(
    store.twinRules,
    HashSet.flatMap((ruleInfo) => {
      return HashSet.fromIterable(positionTokens).pipe(
        HashSet.filter((x) => {
          if (ruleInfo.completion.className === x.text) {
            return true;
          }
          if (x.token.type === 'VARIANT_CLASS') {
            return ruleInfo.completion.className.startsWith(x.token.value[1].value.n);
          }

          return ruleInfo.completion.className.startsWith(x.text);
        }),
        HashSet.map(
          (): TwinRuleWithCompletion => ({
            completion: ruleInfo.completion,
            composition: ruleInfo.composition,
            rule: ruleInfo.rule,
            order: ruleInfo.order,
          }),
        ),
      );
    }),
    // ReadonlyArray.fromIterable,
    // // ReadonlyArray.dedupe,
    // (self) => ReadonlyArray.dedupeWith(self, eqTwinRuleWithCompletion),
  );
};

export const getTokensAtOffset = (node: TemplateNode, offset: number) => {
  return pipe(
    node.parsedNode,
    ReadonlyArray.filter((x) => offset >= x.bodyLoc.start && offset <= x.bodyLoc.end),
    ReadonlyArray.flatMap((x) => getFlattenTemplateToken(x)),
    ReadonlyArray.filter((x) => offset >= x.bodyLoc.start && offset <= x.bodyLoc.end),
    ReadonlyArray.dedupe,
  );
};

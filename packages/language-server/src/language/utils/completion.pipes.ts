import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { TemplateNode, TwinDocument } from '../../documents/document.resource';
import { NativeTwinManagerService } from '../../native-twin/native-twin.models';
import { LocatedGroupTokenWithText } from '../../template/template.models';
import { TwinVariantCompletion } from '../../types/native-twin.types';
import { TemplateTokenData } from '../language.models';
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

export const extractTemplateTokenAtPosition = (
  template: TemplateNode,
  position: vscode.Position,
  twinService: NativeTwinManagerService['Type'],
) => {
  const offset = template.handler.handler.offsetAt(position);
  return pipe(
    template.parsedNode,
    ReadonlyArray.findFirst((x) => offset >= x.bodyLoc.start && offset <= x.bodyLoc.end),
    Option.map((x) => {
      const variantsSuggestions: TwinVariantCompletion[] = [];
      const flatten = getFlattenTemplateToken(x).filter(
        (y) => offset >= y.token.bodyLoc.start && offset <= y.token.bodyLoc.end,
      );
      if (x.token.type === 'GROUP') {
        variantsSuggestions.push(
          ...extractGroupVariantsSuggestions(x.token, twinService),
        );
      }

      const rules = extractClassSuggestions(flatten, twinService);
      return { variantsSuggestions, rules };
    }),
  );
};

export const extractClassSuggestions = (
  tokens: TemplateTokenData[],
  twinService: NativeTwinManagerService['Type'],
) => {
  const uniqueTokens = pipe(tokens, ReadonlyArray.dedupe);

  return pipe(
    twinService.completions.twinRules,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filter((x) => {
      return uniqueTokens.some((y) => {
        if (x.completion.className === y.token.text) return true;
        if (y.token.token.type === 'VARIANT_CLASS') {
          return x.completion.className.startsWith(y.token.token.value[1].value.n);
        }
        return x.completion.className.startsWith(y.token.text);
      });
    }),
  );
};

const extractGroupVariantsSuggestions = (
  group: LocatedGroupTokenWithText,
  twinService: NativeTwinManagerService['Type'],
) => {
  const variantsSuggestions: TwinVariantCompletion[] = [];
  if (group.value.base.token.type === 'VARIANT') {
    const includedVariants = group.value.base.token.value.map((x) => `${x.n}:`);
    pipe(
      twinService.completions.twinVariants,
      HashSet.forEach((x) => {
        if (!includedVariants.includes(x.name)) {
          variantsSuggestions.push(x);
        }
      }),
    );
  }

  return variantsSuggestions;
};

export const getTokensAtOffset = (node: TemplateNode, offset: number) => {
  return pipe(
    node.parsedNode,
    ReadonlyArray.filter((x) => offset >= x.bodyLoc.start && offset <= x.bodyLoc.end),
    ReadonlyArray.flatMap((x) => getFlattenTemplateToken(x)),
    ReadonlyArray.filter(
      (x) => offset >= x.token.bodyLoc.start && offset <= x.token.bodyLoc.end,
    ),
    ReadonlyArray.dedupe,
  );
};

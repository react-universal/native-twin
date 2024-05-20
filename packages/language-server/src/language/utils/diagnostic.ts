import * as ReadOnlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { RuntimeTW } from '@native-twin/core';
import { SheetEntry } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import { ConfigManagerService } from '../../connection/client.config';
import { DocumentsService } from '../../documents/documents.service';
import { documentLanguageRegionToRange } from '../../documents/utils/document.utils';
import { parseTemplate } from '../../native-twin/native-twin.parser';
import { DiagnosticsMeta, DiagnosticsToken, TemplateTokenData } from '../language.models';
import { getDocumentLanguageRegions } from './completion.pipes';
import { getFlattenTemplateToken } from './language.utils';

export const extractDocumentAndRegions = (params: vscode.TextDocumentIdentifier) =>
  Effect.gen(function* () {
    const documentsHandler = yield* DocumentsService;
    const { config } = yield* ConfigManagerService;

    return Option.Do.pipe(
      Option.bind('document', () => documentsHandler.acquireDocument(params.uri)),
      Option.let('regions', ({ document }) =>
        getDocumentLanguageRegions(document, config),
      ),
    );
  });

export const extractTokensFromDocumentRegions = (meta: DiagnosticsMeta) =>
  pipe(
    meta.regions,
    ReadOnlyArray.map((x) => {
      const textWithRange = documentLanguageRegionToRange(x, meta.document);
      const parsed = parseTemplate(
        textWithRange.text,
        meta.document.offsetAt(textWithRange.range.start),
      );

      return new DiagnosticsToken({
        ...textWithRange,
        parsed,
        flatten: parsed.flatMap((x) => getFlattenTemplateToken(x)),
      });
    }),
  );

export const diagnosticTokensToDiagnosticItems = (
  document: TextDocument,
  tokens: DiagnosticsToken[],
  tw: RuntimeTW,
) => {
  return pipe(
    tokens,
    ReadOnlyArray.flatMap((diagnosticToken) => {
      const entries = diagnosticToken.getSheetEntries(tw);
      const entriesProps = getDiagnosticTokenDeclProps(entries);
      return ReadOnlyArray.filterMap(diagnosticToken.flattenUnique, (item) => {
        diagnosticToken.flattenUnique;
        const itemEntries = item.getSheetEntries(tw);

        const duplicatedClassNames = itemEntries.filter(
          (x) => entries.filter((y) => y.className === x.className).length > 1,
        );

        const declarationProps = getDiagnosticTokenDeclProps(itemEntries);
        const duplicatedProps = declarationProps.filter(
          (x) =>
            entriesProps.filter(
              (y) =>
                y.prop === x.prop &&
                x.selectors.sort().join(',') === y.selectors.sort().join(','),
            ).length > 1,
        );

        if (duplicatedProps.length) {
          return Option.some(
            vscode.Diagnostic.create(
              vscode.Range.create(
                document.positionAt(item.token.bodyLoc.start),
                document.positionAt(item.token.bodyLoc.end),
              ),
              'Duplicated Css Property',
            ),
          );
        }

        if (duplicatedClassNames.length) {
          return Option.some(
            vscode.Diagnostic.create(
              vscode.Range.create(
                document.positionAt(item.token.bodyLoc.start),
                document.positionAt(item.token.bodyLoc.end),
              ),
              'Duplicated ClassName',
            ),
          );
        }
        return Option.none();
      });
    }),
  );
};

// RR
export const getDiagnosticTokenDeclProps = (entries: SheetEntry[]) =>
  ReadOnlyArray.flatMap(entries, (x) =>
    x.declarations.map((y) => ({
      prop: y.prop,
      className: x.className,
      selectors: x.selectors,
    })),
  );

export const extractDuplicatedTokens = (
  meta: DiagnosticsMeta,
  tokens: DiagnosticsToken[],
) =>
  pipe(
    tokens,
    ReadOnlyArray.filterMap((current) => {
      const duplicates = hasDuplicatedTokens(current.flatten);
      if (duplicates.length) {
        return Option.some(duplicates);
      }
      return Option.none();
    }),
    ReadOnlyArray.flatten,
    ReadOnlyArray.flatMap((x): vscode.Diagnostic[] => {
      return asArray({
        range: vscode.Range.create(
          meta.document.positionAt(x.token.bodyLoc.start),
          meta.document.positionAt(x.token.bodyLoc.end),
        ),
        message: 'Duplicated className',
      });
    }),
  );

/**
 * Case 1: Not duplicated classes
 */
export const hasDuplicatedTokens = (tokens: TemplateTokenData[]) => {
  const results: TemplateTokenData[] = [];
  pipe(
    tokens,
    ReadOnlyArray.dedupe,
    ReadOnlyArray.forEach((x) =>
      pipe(
        tokens,
        ReadOnlyArray.dedupe,
        ReadOnlyArray.filterMap((y) => {
          if (x.token.text === y.token.text) {
            return Option.some(y);
          }
          return Option.none();
        }),
        (filtered) => {
          if (filtered.length > 1) {
            results.push(x);
          }
        },
      ),
    ),
  );
  return results;
};

export const createTokenResolver =
  (tokensList: TemplateTokenData[]) => (token: TemplateTokenData) =>
    tokensList.some((x) => x.token.text === token.token.text);

import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { ConfigManagerService } from '../../connection/client.config';
import { DocumentLanguageRegion } from '../../documents/document.resource';
import { DocumentsService } from '../../documents/documents.service';
import { getDocumentLanguageLocations } from '../../documents/utils/document.ast';
import { NativeTwinManagerService } from '../../native-twin/native-twin.models';
import { parseTemplate } from '../../native-twin/native-twin.parser';
import { TemplateTokenWithText } from '../../template/template.models';
import { NativeTwinPluginConfiguration } from '../../types/extension.types';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import { TemplateTokenData } from '../language.models';
import { getFlattenTemplateToken } from './language.utils';

export const extractDocumentNodeAtPosition = (
  params: vscode.TextDocumentPositionParams,
) =>
  Effect.gen(function* () {
    const documentsHandler = yield* DocumentsService;
    const { config } = yield* ConfigManagerService;
    return Option.Do.pipe(
      Option.bind('document', () =>
        documentsHandler.acquireDocument(params.textDocument.uri),
      ),
      Option.let('regions', ({ document }) =>
        getDocumentLanguageRegions(document, config),
      ),
      Option.let('cursorOffset', ({ document }) => document.offsetAt(params.position)),
      Option.let(
        'isEmptyCompletion',
        ({ document, cursorOffset }) =>
          document
            .getText(
              vscode.Range.create(
                document.positionAt(cursorOffset - 1),
                document.positionAt(cursorOffset + 1),
              ),
            )
            .replaceAll(/\s/g, '') === '',
      ),
      Option.bind('rangeAtPosition', ({ regions, cursorOffset }) =>
        Option.fromNullable(
          regions.find(
            (x) => cursorOffset >= x.offset.start && cursorOffset <= x.offset.end,
          ),
        ),
      ),
      Option.let('textAtPosition', ({ rangeAtPosition, document }) => {
        return document.getText(rangeAtPosition.range);
      }),
      Option.let('parsedText', ({ textAtPosition, rangeAtPosition }) =>
        parseTemplate(textAtPosition, rangeAtPosition.offset.start),
      ),
    );
  });

interface ExtractParsedParams {
  parsedText: TemplateTokenWithText[];
  cursorOffset: number;
}
export const extractParsedNodesAtPosition = ({
  cursorOffset,
  parsedText,
}: ExtractParsedParams) =>
  Option.Do.pipe(
    Option.bind('parsedNodeAtPosition', () =>
      pipe(
        parsedText,
        ReadonlyArray.findFirst(
          (x) => cursorOffset >= x.bodyLoc.start && cursorOffset <= x.bodyLoc.end,
        ),
      ),
    ),
    Option.let('flattenNodes', ({ parsedNodeAtPosition }) =>
      pipe(
        parsedNodeAtPosition,
        getFlattenTemplateToken,
        ReadonlyArray.filter(
          (y) =>
            cursorOffset >= y.token.bodyLoc.start && cursorOffset <= y.token.bodyLoc.end,
        ),
        // FIXME: filter nodes instead dedupe
        ReadonlyArray.dedupe,
      ),
    ),
  );

const createCompletionTokenResolver =
  ({ base, token }: TemplateTokenData) =>
  (twinRule: TwinRuleWithCompletion) => {
    let completionText = token.completionText;

    if (token.token.type === 'VARIANT_CLASS' && base) {
      if (base.token.type === 'CLASS_NAME') {
        completionText = `${base.token.value.n}-${token.token.value[1].value.n}`;
      }

      if (base.token.type === 'VARIANT') {
        completionText = `${token.token.value[1].value.n}`;
      }
    }

    if (completionText === twinRule.completion.className) return true;

    if (token.token.type === 'VARIANT_CLASS') {
      return twinRule.completion.className.startsWith(token.token.value[1].value.n);
    }

    if (base) {
      if (base.token.type === 'CLASS_NAME') {
        return twinRule.completion.className.startsWith(base.token.value.n);
      }
    }

    return twinRule.completion.className.startsWith(completionText);
  };

export const getCompletionsForTokens = (
  tokens: TemplateTokenData[],
  twinService: NativeTwinManagerService['Type'],
) => {
  const resolvers = tokens.map(createCompletionTokenResolver);
  return pipe(
    twinService.completions.twinRules,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filter((x) => resolvers.some((y) => y(x))),
  );
};

export const getDocumentLanguageRegions = (
  document: TextDocument,
  config: NativeTwinPluginConfiguration,
) =>
  getDocumentLanguageLocations(document.getText(), config).map((x) =>
    DocumentLanguageRegion.create(document, x),
  );

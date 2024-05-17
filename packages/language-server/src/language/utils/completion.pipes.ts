import { TinyColor } from '@ctrl/tinycolor';
import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { ConfigManagerService } from '../../connection/client.config';
import {
  DocumentLanguageRegion,
  TemplateNode,
  TwinDocument,
} from '../../documents/document.resource';
import { DocumentsService } from '../../documents/documents.service';
import { getDocumentLanguageLocations } from '../../documents/utils/document.ast';
import {
  NativeTwinManager,
  NativeTwinManagerService,
} from '../../native-twin/native-twin.models';
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
    if (token.text === twinRule.completion.className) return true;
    if (token.token.type === 'VARIANT_CLASS') {
      return twinRule.completion.className.startsWith(token.token.value[1].value.n);
    }

    if (base) {
      if (base.token.type === 'CLASS_NAME') {
        return twinRule.completion.className.startsWith(base.token.value.n);
      }
    }

    return twinRule.completion.className.startsWith(token.text);
  };

export const getCompletionsForTokens = (
  tokens: TemplateTokenData[],
  twinService: NativeTwinManagerService['Type'],
) => {
  // TODO: Remove necessary?
  // const uniqueTokens = pipe(tokens, ReadonlyArray.dedupe);
  const resolvers = tokens.map(createCompletionTokenResolver);
  return pipe(
    twinService.completions.twinRules,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filter((x) => resolvers.some((y) => y(x))),
  );
};

export const getDocumentTemplatesColors = (
  templates: TemplateNode[],
  twinService: NativeTwinManager,
  twinDocument: TwinDocument,
) =>
  pipe(
    templates,
    ReadonlyArray.flatMap((template) => template.parsedNode),
    ReadonlyArray.flatMap((x) => getFlattenTemplateToken(x)),
    ReadonlyArray.dedupe,
    ReadonlyArray.flatMap((x) => templateTokenToColorInfo(x, twinService, twinDocument)),
  );

const templateTokenToColorInfo = (
  templateNode: TemplateTokenData,
  twinService: NativeTwinManager,
  twinDocument: TwinDocument,
): vscode.ColorInformation[] =>
  twinService.completions.twinRules.pipe(
    HashSet.filter((y) => y.completion.className === templateNode.token.text),
    ReadonlyArray.fromIterable,
    ReadonlyArray.map((completion) => ({ node: templateNode, completion })),
    ReadonlyArray.filter((x) => x.completion.rule.themeSection === 'colors'),
    ReadonlyArray.map((x): vscode.ColorInformation => {
      const color = new TinyColor(x.completion.completion.declarationValue).toRgb();
      return {
        range: vscode.Range.create(
          twinDocument.handler.positionAt(x.node.token.bodyLoc.start),
          twinDocument.handler.positionAt(x.node.token.bodyLoc.end),
        ),
        color: vscode.Color.create(color.r / 255, color.g / 255, color.b / 255, color.a),
      };
    }),
  );

export const getDocumentLanguageRegions = (
  document: TextDocument,
  config: NativeTwinPluginConfiguration,
) =>
  getDocumentLanguageLocations(document.getText(), config).map((x) =>
    DocumentLanguageRegion.create(document, x),
  );

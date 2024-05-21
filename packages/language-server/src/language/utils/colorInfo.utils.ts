import { TinyColor } from '@ctrl/tinycolor';
import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as vscode from 'vscode-languageserver/node';
import { TemplateNode, TwinDocument } from '../../documents/document.resource';
import { NativeTwinManager } from '../../native-twin/native-twin.models';
import { TemplateTokenData } from '../language.models';
import { getFlattenTemplateToken } from './language.utils';

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

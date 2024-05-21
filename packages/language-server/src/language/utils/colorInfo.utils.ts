import { Numberify, RGBA, TinyColor } from '@ctrl/tinycolor';
import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { TemplateNode, TwinDocument } from '../../documents/document.resource';
import { NativeTwinManager } from '../../native-twin/native-twin.models';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
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
): vscode.ColorInformation[] => {
  const range = vscode.Range.create(
    twinDocument.handler.positionAt(templateNode.token.bodyLoc.start),
    twinDocument.handler.positionAt(templateNode.token.bodyLoc.end),
  );
  const templateFilter = getTemplateNodeClassNameAndRange(templateNode, range);
  return twinService.completions.twinRules.pipe(
    ReadonlyArray.fromIterable,
    ReadonlyArray.filterMap((y) =>
      y.completion.className === templateFilter.className
        ? Option.some(y)
        : Option.none(),
    ),
    ReadonlyArray.filter((x) => x.rule.themeSection === 'colors'),
    ReadonlyArray.map(
      (x): vscode.ColorInformation => completionRuleToColorInfo(x, range),
    ),
  );
};

const completionRuleToColorInfo = (
  rule: TwinRuleWithCompletion,
  range: vscode.Range,
) => ({
  range: range,
  color: toVsCodeColor(new TinyColor(rule.completion.declarationValue).toRgb()),
});

const toVsCodeColor = (color: Numberify<RGBA>): vscode.Color =>
  vscode.Color.create(color.r / 255, color.g / 255, color.b / 255, color.a);

const getTemplateNodeClassNameAndRange = (
  templateNode: TemplateTokenData,
  range: vscode.Range,
) => {
  let className = templateNode.token.text;

  if (templateNode.base) {
    if (templateNode.base.token.type === 'VARIANT') {
      const variantText = `${templateNode.base.token.value.map((x) => x.n).join(':')}:`;
      className = className.replace(variantText, '');
    }
    if (templateNode.base.token.type === 'VARIANT_CLASS') {
      const variantText = `${templateNode.base.token.value[0].value.map((x) => x.n).join(':')}:`;
      className = className.replace(variantText, '');
    }
  }
  if (templateNode.token.token.type === 'VARIANT_CLASS') {
    const variantText = `${templateNode.token.token.value[0].value.map((x) => x.n).join(':')}:`;
    className = className.replace(variantText, '');
  }
  if (templateNode.token.token.type === 'VARIANT_CLASS') {
    const variantText = `${templateNode.token.token.value[0].value.map((x) => x.n).join(':')}:`;
    const newOffset = range.start.character + variantText.length;
    range.start.character = newOffset;
  }
  return { className, range };
};

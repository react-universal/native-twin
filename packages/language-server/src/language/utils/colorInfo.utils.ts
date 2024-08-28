import { Numberify, RGBA, TinyColor } from '@ctrl/tinycolor';
import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import {
  TemplateTokenData,
  NativeTwinManager,
  TwinRuleCompletion,
} from '@native-twin/language-service';
import { TwinDocument } from '../../documents/models/twin-document.model';

export const getDocumentTemplatesColors = (
  twinService: NativeTwinManager,
  twinDocument: TwinDocument,
) =>
  pipe(
    twinDocument.getLanguageRegions(),
    ReadonlyArray.flatMap((template) => template.regionNodes),
    ReadonlyArray.flatMap((x) => x.flattenToken),
    ReadonlyArray.dedupe,
    ReadonlyArray.flatMap((x) => templateTokenToColorInfo(x, twinService, twinDocument)),
  );

/** File private */
const templateTokenToColorInfo = (
  templateNode: TemplateTokenData,
  twinService: NativeTwinManager,
  twinDocument: TwinDocument,
): vscode.ColorInformation[] => {
  const range = vscode.Range.create(
    twinDocument.offsetToPosition(templateNode.token.bodyLoc.start),
    twinDocument.offsetToPosition(templateNode.token.bodyLoc.end),
  );
  const templateFilter = templateNode.adjustColorInfo(range);
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

/** File private */
const completionRuleToColorInfo = (rule: TwinRuleCompletion, range: vscode.Range) => ({
  range: range,
  color: toVsCodeColor(new TinyColor(rule.completion.declarationValue).toRgb()),
});

/** File private */
const toVsCodeColor = (color: Numberify<RGBA>): vscode.Color =>
  vscode.Color.create(color.r / 255, color.g / 255, color.b / 255, color.a);

import { type Numberify, type RGBA, TinyColor } from '@ctrl/tinycolor';
import type * as vscode from 'vscode-languageserver';
import { Color } from 'vscode-languageserver-types';

// export const getDocumentTemplatesColors = (
//   twinDocument: BaseTwinTextDocument,
//   languageRegions: DocumentLanguageRegion[],
// ) =>
//   pipe(
//     languageRegions,
//     ReadonlyArray.flatMap((template) => template.regionNodes),
//     ReadonlyArray.flatMap((x) => x.flattenToken),
//     ReadonlyArray.dedupe,
//     ReadonlyArray.flatMap((x) => templateTokenToColorInfo(x, twinDocument)),
//   );

// /** File private */
// export const templateTokenToColorInfo = (
//   templateNode: TemplateTokenData,
//   twinDocument: BaseTwinTextDocument,
//   twinService: any = {},
// ): vscode.ColorInformation[] => {
//   const range = Range.create(
//     twinDocument.positionAt(templateNode.token.bodyLoc.start),
//     twinDocument.positionAt(templateNode.token.bodyLoc.end),
//   );
//   const templateFilter = templateNode.adjustColorInfo(range);
//   return twinService.completions.twinRules.pipe(
//     ReadonlyArray.fromIterable,
//     ReadonlyArray.filterMap((y: any) =>
//       y.completion.className === templateFilter.className ? Option.some(y) : Option.none(),
//     ),
//     ReadonlyArray.filter((x: any) => x.rule.themeSection === 'colors'),
//     ReadonlyArray.map((x): vscode.ColorInformation => declarationValueToColorInfo(x, range)),
//   );
// };

/** File private */
export const declarationValueToColorInfo = (
  declarationValue: string,
  range: vscode.Range,
): vscode.ColorInformation => ({
  range: range,
  color: toVsCodeColor(new TinyColor(declarationValue).toRgb()),
});

/** File private */
const toVsCodeColor = (color: Numberify<RGBA>): vscode.Color =>
  Color.create(color.r / 255, color.g / 255, color.b / 255, color.a);

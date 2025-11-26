import { type Numberify, type RGBA, TinyColor } from '@ctrl/tinycolor';
import type * as vscode from 'vscode-languageserver';
import { Color } from 'vscode-languageserver-types';

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

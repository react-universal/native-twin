import type { CssDeclarationValueNode } from '../../types';
import * as parser from '../lib';
import {
  parseBetweenBrackets,
  parseCalcValue, // parseColorValue,
  parseDimensionsValue,
  parseRawValue,
  parseSemiColonSeparated,
  parseTranslateValue,
} from './css.common';
import { parseDeclarationProperty } from './declaration.tokenizer';

export const parseRawDeclarationValue: parser.Parser<CssDeclarationValueNode> = parser.choice([
  // parseColorValue,
  parseDimensionsValue,
  parseTranslateValue,
  parseCalcValue,
  parseRawValue,
]);

export const parseRule = parseBetweenBrackets(
  parseSemiColonSeparated(parser.sequence(parseDeclarationProperty, parseRawDeclarationValue)),
);

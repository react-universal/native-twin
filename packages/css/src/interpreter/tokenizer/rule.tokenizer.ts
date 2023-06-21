import type { CssDeclarationValueNode } from '../../types';
import * as parser from '../lib';
import {
  parseBetweenBrackets,
  parseCalcValue,
  parseDimensionsValue,
  parseRawValue,
  parseSemiColonSeparated,
  parseTranslateValue,
} from './css.common';
import { parseDeclarationProperty } from './declaration.tokenizer';

export const parseRawDeclarationValue: parser.Parser<CssDeclarationValueNode> = parser.choice([
  parseDimensionsValue,
  parseTranslateValue,
  parseCalcValue,
  parseRawValue,
]);

export const parseRule = parseBetweenBrackets(
  parseSemiColonSeparated(parser.sequence(parseDeclarationProperty, parseRawDeclarationValue)),
);

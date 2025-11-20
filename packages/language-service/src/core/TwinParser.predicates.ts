import { hasOwnProperty } from '@native-twin/helpers';
import type * as TwinParserModel from '../models/TwinParser.models';

export const isTokenType =
  <A extends string>(type: A) =>
  (token: unknown): token is { type: A } => {
    const isUndef = typeof token === 'undefined';
    return !isUndef && hasOwnProperty.call(token, 'type') && (token as any)['type'] === type;
  };

export const isGroupToken = isTokenType('GROUP');
export const isArbitraryToken = isTokenType('ARBITRARY');
export const isClassNameToken = isTokenType('CLASS_NAME');
export const isVariantClassToken = isTokenType('VARIANT_CLASS');
export const isComposedClassName = isTokenType('ComposedClass');
export const isComposedClassGroup = isTokenType('ComposedGroup');

export const isAnyTokenExceptGroup = (x: unknown) =>
  isClassNameToken(x) || isArbitraryToken(x) || isVariantClassToken(x);

export const isComposedNodeAtOffset = (
  node: TwinParserModel.AnyTwinComposedClass,
  documentOffset: number,
) => isOffsetAtLocation(documentOffset, node.documentLoc);

export const isOffsetAtLocation = (offset: number, location: TwinParserModel.WithLocation) =>
  offset >= location.start && offset <= location.end;

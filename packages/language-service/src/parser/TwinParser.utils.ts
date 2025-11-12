import { hasOwnProperty } from '@native-twin/helpers';
import type { TwinParserModel } from './TwinParser.models';

export const isTokenType =
  <A extends string>(type: A) =>
  (token: unknown): token is { type: A } => {
    const isUndef = typeof token === 'undefined';
    return !isUndef && hasOwnProperty.call(token, 'type') && (token as any)['type'] === type;
  };

export const isComposedTokenType =
  <A extends string>(type: A) =>
  (node: unknown): node is { token: { type: A } } => {
    const isUndef = typeof node === 'undefined';
    return (
      !isUndef &&
      hasOwnProperty.call(node, 'token') &&
      hasOwnProperty.call((node as any).token, 'type') &&
      (node as any)['token']['type'] === type
    );
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

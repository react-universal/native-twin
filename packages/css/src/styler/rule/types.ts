import type * as ValidProps from './constants';

export type ValidDimensionProp = keyof typeof ValidProps.dimensionWithUnit;
export type ValidViewProp = keyof typeof ValidProps.view;
export type ValidTextProp = keyof typeof ValidProps.text;
export type ValidImageProp = keyof typeof ValidProps.image;
export type ValidColorProp = keyof typeof ValidProps.color;
export type ValidTransformItemProp = keyof typeof ValidProps.transformItem;

export type ValidStyledProp =
  | ValidDimensionProp
  | ValidDimensionProp
  | ValidTextProp
  | ValidImageProp
  | ValidTransformItemProp;

export type StyleValueType = 'color' | 'dimension' | 'unknown';

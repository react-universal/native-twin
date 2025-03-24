import { hasOwnProperty } from '@native-twin/helpers';
import * as ValidProp from './constants';
import type {
  ValidColorProp,
  ValidDimensionProp,
  ValidImageProp,
  ValidTextProp,
  ValidViewProp,
} from './types';

export const isDimension = (prop: string): prop is ValidDimensionProp =>
  hasOwnProperty.call(ValidProp.dimensionWithUnit, prop);

export const isView = (prop: string): prop is ValidViewProp =>
  hasOwnProperty.call(ValidProp.view, prop);

export const isText = (prop: string): prop is ValidTextProp =>
  hasOwnProperty.call(ValidProp.text, prop);

export const isImage = (prop: string): prop is ValidImageProp =>
  hasOwnProperty.call(ValidProp.image, prop);

export const isColor = (prop: string): prop is ValidColorProp =>
  hasOwnProperty.call(ValidProp.color, prop);

export const supportsAuto = (prop: string) => hasOwnProperty.call(ValidProp.supportStyleAuto, prop);

export const supportsNone = (prop: string) => hasOwnProperty.call(ValidProp.supportStyleNone, prop);

export const isUnitless = (prop: string) => hasOwnProperty.call(ValidProp.unitless, prop);

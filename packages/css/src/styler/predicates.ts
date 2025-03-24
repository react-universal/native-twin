import { hasOwnProperty } from '@native-twin/helpers';
import { unitlessCssProps } from '../css/css.constants';

export const isUnitlessDeclProp = (prop: string) => hasOwnProperty.call(unitlessCssProps, prop);

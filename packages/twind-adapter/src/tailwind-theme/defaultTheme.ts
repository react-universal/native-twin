import type { BaseTheme } from './baseTheme';
import baseTheme from './baseTheme';
import * as colors from './colors';

export type DefaultTheme = { colors: typeof colors } & BaseTheme;

const theme: DefaultTheme = { ...baseTheme, colors };

export default theme;

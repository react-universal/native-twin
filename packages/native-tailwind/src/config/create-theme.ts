import * as tailwindTheme from '../tailwind-preset/tailwind-theme';
import type { __Theme__ } from '../types/theme.types';

export function createThemeHandler<Theme extends Record<string, any>>(theme: Theme) {
  return <Key extends keyof Theme>(section: Key, segment: string) => {
    return theme[section][segment];
  };
}

export function createTailwindTheme<UserTheme = {}>(
  userTheme: UserTheme,
): __Theme__ & UserTheme {
  return {
    ...tailwindTheme,
    ...userTheme,
  };
}

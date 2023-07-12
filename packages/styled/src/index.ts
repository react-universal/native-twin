import { SheetManager } from './internals/sheet';

export { useIsDarkMode } from './hooks/useIsDarkMode';
export { styled } from './styled';
export { useBuildStyledComponent } from './hooks/useBuildStyledComponent';

export const setTailwindConfig = SheetManager.setThemeConfig;

export type { ForwardedStyledComponent } from './styled/StyledComponent';

import { SheetManager } from './native/sheet';

export { styled } from './native/StyledComponent';
export { useBuildStyledComponent } from './native/hooks/useStyledComponent';
export { useStyledContext } from './native/hooks/useStyledContext';

export const setTailwindConfig = SheetManager.setThemeConfig;

export type { ForwardedStyledComponent, PropsFrom } from './types/styled.types';

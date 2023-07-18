import { SheetManager } from './native/sheet';

export { styled } from './native/StyledComponent';
export { useBuildStyledComponent } from './native/hooks/useStyledComponent';

export const setTailwindConfig = SheetManager.setThemeConfig;

export type { ForwardedStyledComponent } from './types/styled.types';
export type { PropsFrom } from './styled';

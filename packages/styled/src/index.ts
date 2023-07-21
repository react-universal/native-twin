import { styledComponents } from './native';

export { useBuildStyledComponent } from './native/hooks/useStyledComponent';
export { useStyledContext } from './native/hooks/useStyledContext';
export { install } from './native/sheet';

export type {
  ForwardedStyledComponent,
  PropsFrom,
  DefaultTheme,
  StyledProps,
  ComponentStyleProp,
  RegisteredComponent,
  ComponentStylesheet,
} from './types/styled.types';
export type { StyledContext, SheetMetadata } from './types/css.types';
export default styledComponents;

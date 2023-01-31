import type { TextProps, ViewProps } from 'react-native';
import type { typographyVariants } from './typography-variants';

export type TTypographyProps = {
  htmlFor?: string;
  pointerEvents?: ViewProps['pointerEvents'];
  variant?: keyof typeof typographyVariants;
  bold?: boolean;
  className?: string;
} & TextProps;

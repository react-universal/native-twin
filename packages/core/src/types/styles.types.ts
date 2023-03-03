import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type IStyleType = Record<string, ImageStyle | TextStyle | ViewStyle>;
export type IStyleTuple = [string, IStyleType];

export type IExtraProperties<T> = T & {
  style?: ImageStyle | TextStyle | ViewStyle;
  className?: string;
  tw?: string;
  children?: ReactNode;
};

export type TInternalStyledComponentProps = {
  nthChild: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  parentID: string;
};
export interface InteractionProps extends PressableProps {
  onMouseDown?: PressableProps['onPressIn'];
  onMouseUp?: PressableProps['onPressOut'];
}

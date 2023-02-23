import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { TPseudoSelectorTypes } from './store.types';

export type IStyleType = Record<string, any>;
export type IStyleTuple = [string, IStyleType];

export type IComponentState = Record<TPseudoSelectorTypes, SharedValue<boolean>>;

export type IExtraProperties = {
  style?: ImageStyle | TextStyle | ViewStyle;
  className?: string;
  tw?: string;
  children?: ReactNode;
};
export interface InteractionProps extends PressableProps {
  onMouseDown?: PressableProps['onPressIn'];
  onMouseUp?: PressableProps['onPressOut'];
}

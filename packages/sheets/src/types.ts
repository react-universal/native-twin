import type { ReactNode } from 'react';
import type { PressableProps, StyleProp } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type IStyleProp = StyleProp<ImageStyle | TextStyle | ViewStyle>;
export type IStyleType = Record<string, ImageStyle | TextStyle | ViewStyle>;
export type IStyleTuple = [string, IStyleType];

export type StyledProps<P> = {
  className?: string;
  tw?: string;
  nthChild: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  parentID?: string;
  children?: ReactNode;
  style?: IStyleProp;
} & P;

export interface InteractionProps extends PressableProps {
  onMouseDown?: PressableProps['onPressIn'];
  onMouseUp?: PressableProps['onPressOut'];
}

export interface IUseStyleSheetsInput
  extends StyledProps<{
    inlineStyles?: IStyleProp;
    classPropsTuple?: [string, string][];
  }> {}

export type IInteractionPayload = {
  classNames: string;
  styles: IStyleType;
};

export type KeyOfMap<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown>
  ? K
  : never;

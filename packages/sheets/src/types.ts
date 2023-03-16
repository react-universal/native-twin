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

export type TInteractionPseudoSelectors = 'hover' | 'active' | 'focus' | 'group-hover';

export type TAppearancePseudoSelectors = 'dark' | 'last' | 'first' | 'even' | 'odd';

export type IInteractionPayload = {
  classNames: string;
  styles: IStyleType;
};
export type IComponentInteractions = [TInteractionPseudoSelectors, IInteractionPayload];
export type IComponentAppearance = [TAppearancePseudoSelectors, IInteractionPayload];

export type IClassNamesStyle = {
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  mask: number;
};

export type KeyOfMap<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown>
  ? K
  : never;

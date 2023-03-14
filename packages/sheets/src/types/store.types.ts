import type { ReactNode } from 'react';
import type {
  ImageStyle,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { IStyleTuple, IStyleType } from '@universal-labs/stylesheets';

export type TInteractionPseudoSelectors = 'hover' | 'active' | 'focus' | 'group-hover';

export type TAppearancePseudoSelectors = 'dark' | 'last' | 'first';

export type IInteractionPayload = {
  classNames: string;
  styles: IStyleType;
};
export type IComponentInteractions = [TInteractionPseudoSelectors, IInteractionPayload];
export type IComponentAppearance = [TAppearancePseudoSelectors, IInteractionPayload];

export type IComponent = {
  id: string;
  className?: string;
  styles: IStyleType;
  interactionStyles: IComponentInteractions[];
};

type IComponentID = string;

export type IRegisteredComponent = [IComponentID, IComponent];

export type IRegisterComponentArgs = TInternalStyledComponentProps & {
  className?: string;
  inlineStyles: IExtraProperties<{}>['style'];
  parentID: string;
};

export type IComponentsStore = {
  styles: IStyleTuple[];
};

export type IClassNamesStyle = {
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  mask: number;
};

export type KeyOfMap<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown>
  ? K
  : never;

export type IExtraProperties<T> = T & {
  style?: StyleProp<ImageStyle | TextStyle | ViewStyle>;
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

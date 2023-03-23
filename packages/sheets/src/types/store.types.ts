import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import type {
  IStyleProp,
  IStyleTuple,
  IStyleType,
  TAppearancePseudoSelectors,
  TInteractionPseudoSelectors,
  TInternalStyledComponentProps,
} from '../types';

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
  classProps: Record<string, string>;
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
  style?: IStyleProp;
  className?: string;
  tw?: string;
  children?: ReactNode;
};

export interface InteractionProps extends PressableProps {
  onMouseDown?: PressableProps['onPressIn'];
  onMouseUp?: PressableProps['onPressOut'];
}

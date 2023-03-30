import type { PressableProps } from 'react-native';
import type { IStyleProp, IStyleTuple, IStyleType, StyledProps } from '../types';

export type IInteractionPayload = {
  classNames: string;
  styles: IStyleType;
};

export type IRegisterComponentArgs = StyledProps<{
  inlineStyles: IStyleProp;
  classPropsTuple?: [string, string][];
}>;

export type IComponentsStore = {
  styles: IStyleTuple[];
};

export type KeyOfMap<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown>
  ? K
  : never;

export interface InteractionProps extends PressableProps {
  onMouseDown?: PressableProps['onPressIn'];
  onMouseUp?: PressableProps['onPressOut'];
}

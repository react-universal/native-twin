import type { ElementType, ReactElement, ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import type { TPseudoSelectorTypes } from '@react-universal/core';

export type IComponentState = Record<TPseudoSelectorTypes, boolean>;

export type IExtraProperties = {
  className?: string;
  tw?: string;
  children?: ReactNode;
};

export type StyledComponentType = {
  <T>(
    props: T &
      IExtraProperties & {
        component: ElementType<T>;
      },
  ): ReactElement<T>;
};

export interface InteractionProps extends PressableProps {
  onMouseDown?: PressableProps['onPressIn'];
  onMouseUp?: PressableProps['onPressOut'];
}

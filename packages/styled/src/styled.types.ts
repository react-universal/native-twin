import type { ElementType, ReactElement, ReactNode } from 'react';
import type { PressableProps, StyleProp } from 'react-native';

export type IExtraProperties = {
  className?: string;
  tw?: string;
  style?: StyleProp<any>;
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

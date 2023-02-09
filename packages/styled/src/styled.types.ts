import type { ElementType, ReactElement } from 'react';
import type { PressableProps } from 'react-native';

export type IExtraProperties = {
  className?: string;
  tw?: string;
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

import type { ComponentType } from 'react';
import type { PressableProps } from 'react-native';
import { Pressable } from '@universal-labs/primitives';
import type { SvgProps } from 'react-native-svg';

interface IIConProps extends SvgProps {
  size?: keyof typeof sizes;
}

interface IButtonIconProps extends PressableProps {
  Icon: ComponentType<IIConProps>;
  onPress: () => void;
  size?: keyof typeof sizes;
}

const sizes = {
  sm: '16',
  md: '20',
  lg: '30',
  xl: '40',
  '2xl': '50',
  '3xl': '60',
  '4xl': '80',
};

const ButtonIcon = ({ Icon, onPress, ...restProps }: IButtonIconProps) => {
  return (
    <Pressable onPress={onPress} {...restProps}>
      <Icon />
    </Pressable>
  );
};

export { ButtonIcon };

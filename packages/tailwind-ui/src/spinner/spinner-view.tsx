import { colors } from '@medico/universal/tailwind';
import { SizesDesignTokens, createSizeTokens } from '@medico/universal/tailwind/tokens';
import { useIsDarkMode } from '@react-universal/core';
import Svg, { Circle } from 'react-native-svg';

const spinnerSizeMap = createSizeTokens([16, 24, 32, 48, 64]);

export type SpinnerProps = {
  size?: SizesDesignTokens;
  color?: string;
  secondaryColor?: string;
  duration?: number;
};

export const getSpinnerSize = (size: SizesDesignTokens) => {
  return spinnerSizeMap.get(size);
};

export const SpinnerView = ({
  size = 'md',
  color = colors.primary[50],
  secondaryColor: secondaryColorProp,
}: SpinnerProps) => {
  const isDark = useIsDarkMode();
  const secondaryColor = secondaryColorProp
    ? secondaryColorProp
    : isDark
    ? colors.primary[100]
    : '#F4F4F5';
  return (
    <Svg
      width={spinnerSizeMap.get(size) ?? 32}
      height={spinnerSizeMap.get(size) ?? 32}
      viewBox='0 0 32 32'
    >
      <Circle cx={16} cy={16} fill='none' r={14} strokeWidth={4} stroke={secondaryColor} />
      <Circle
        cx={16}
        cy={16}
        fill='none'
        r={14}
        strokeWidth={4}
        stroke={color}
        strokeDasharray={80}
        strokeDashoffset={56}
      />
    </Svg>
  );
};

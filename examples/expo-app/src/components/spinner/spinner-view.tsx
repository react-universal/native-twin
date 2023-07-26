import Svg, { Circle } from 'react-native-svg';
import colors from 'tailwindcss/colors';

// import { SizesDesignTokens, createSizeTokens } from '@medico/universal/tailwind/tokens';

// const spinnerSizeMap = createSizeTokens([16, 24, 32, 48, 64]);

export type SpinnerProps = {
  // size?: SizesDesignTokens;
  color?: string;
  secondaryColor?: string;
  duration?: number;
};

// export const getSpinnerSize = (size: SizesDesignTokens) => {
//   return spinnerSizeMap.get(size);
// };

export const SpinnerView = ({
  color = colors.blue[50],
  secondaryColor: secondaryColorProp,
}: SpinnerProps) => {
  const isDark = false;
  const secondaryColor = secondaryColorProp
    ? secondaryColorProp
    : isDark
    ? colors.blue[100]
    : '#F4F4F5';
  return (
    <Svg
      // width={spinnerSizeMap.get(size) ?? 32}
      // height={spinnerSizeMap.get(size) ?? 32}
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

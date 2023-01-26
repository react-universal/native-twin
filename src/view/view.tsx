import { forwardRef } from 'react';
import { View as ReactNativeView, ViewProps } from 'react-native';
import { styled } from '@react-universal/nativewind.tailwind';

const StyledView = styled(ReactNativeView);

StyledView.displayName = 'View';

export const View = forwardRef(function View(props: ViewProps, ref) {
  return <StyledView ref={ref} {...props} />;
});
export type { ViewProps };

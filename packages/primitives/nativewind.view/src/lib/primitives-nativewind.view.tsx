import { ComponentProps, ComponentType, forwardRef } from 'react';
import { View as ReactNativeView, ViewProps } from 'react-native';
import { styled } from '@react-universal/nativewind.core';

const StyledView = styled(ReactNativeView);

StyledView.displayName = 'View';

export const View = forwardRef<
  ComponentType<typeof ReactNativeView>,
  ComponentProps<typeof StyledView>
>(function View(props: ViewProps, ref) {
  return <StyledView ref={ref} {...props} />;
});
export type { ViewProps };

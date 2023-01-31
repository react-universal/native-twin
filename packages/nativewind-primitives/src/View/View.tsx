import { forwardRef } from 'react';
import { View as ReactNativeView, ViewProps as NativeViewProps } from 'react-native';
import { TW, createStyledComponent, mergeTWClasses } from '@react-universal/nativewind-utils';

type ViewProps = Omit<NativeViewProps, 'tw'> & {
  tw?: string | Array<string> | TW[];
};

const StyledView = createStyledComponent(ReactNativeView);

const View = forwardRef(function View({ tw, ...props }: ViewProps, ref) {
  return <StyledView {...props} tw={mergeTWClasses(tw)} ref={ref} />;
});

StyledView.displayName = 'View';

export type { ViewProps };

export default View;

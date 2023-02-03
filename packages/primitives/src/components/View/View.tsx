import { forwardRef } from 'react';
import { View as ReactNativeView, ViewProps as NativeViewProps } from 'react-native';
import { styled } from '../../styled';
import { mergeTWClasses } from '../../utils/mergeClasses';

type ViewProps = Omit<NativeViewProps, 'className'> & {
  className?: string;
};

const StyledView = styled(ReactNativeView);

const View = forwardRef<ReactNativeView, ViewProps>(function View(
  { className, ...props },
  ref,
) {
  return <StyledView {...props} className={mergeTWClasses(className)} ref={ref} />;
});

export type { ViewProps };

export default View;

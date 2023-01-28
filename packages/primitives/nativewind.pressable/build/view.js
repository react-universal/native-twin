import { forwardRef } from 'react';
import { View as ReactNativeView } from 'react-native';
import { styled } from '@react-universal/nativewind.core';
const StyledView = styled(ReactNativeView);
StyledView.displayName = 'View';
export const View = forwardRef(function View(props, ref) {
    return <StyledView ref={ref} {...props}/>;
});
//# sourceMappingURL=view.js.map
import type { ComponentProps } from 'react';
import { View as ReactNativeView } from 'react-native';
import { styled } from '@react-universal/core';

const View = styled(ReactNativeView)();

type ViewProps = ComponentProps<typeof View>;

export type { ViewProps };

export default View;

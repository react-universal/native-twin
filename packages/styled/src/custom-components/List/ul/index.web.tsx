import { type ComponentType, forwardRef } from 'react';
import type { ViewProps } from 'react-native';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';

export const UL = () => {
  const Element = forwardRef((props: ViewProps, ref) => {
    return unstable_createElement('ul', {
      ...props,
      accessibilityRole: 'list',
      ref,
    });
  }) as ComponentType<ViewProps>;
  Element.displayName = 'UL';
  return Element;
};

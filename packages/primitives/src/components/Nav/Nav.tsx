import { ComponentProps, ComponentType, forwardRef, ReactHTML } from 'react';
import { Platform, View } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
import type { ViewProps } from '../View';

function createView(tag: keyof ReactHTML): ComponentType<ViewProps> {
  const Element = forwardRef((props: ViewProps, ref) => {
    if (Platform.OS === 'web') {
      return unstable_createElement(tag, { ...props, ref });
    }
    return <View {...props} ref={ref} />;
  }) as ComponentType<ViewProps>;

  Element.displayName = tag.toLocaleUpperCase();
  return Element;
}

const Nav = styled(createView('nav')) as ForwardedStyledComponent<View>;

type NavProps = ComponentProps<typeof Nav>;

export type { NavProps };

export default Nav;

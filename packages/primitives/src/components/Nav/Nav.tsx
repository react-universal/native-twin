import { ComponentType, forwardRef, ReactHTML } from 'react';
import { Platform, View, ViewProps } from 'react-native';
import styled from '@universal-labs/styled';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';

function createView(tag: keyof ReactHTML): ComponentType<ViewProps> {
  const Element = forwardRef((props: ViewProps, ref: any) => {
    if (Platform.OS === 'web') {
      return unstable_createElement(tag, { ...props, ref });
    }
    return <View {...props} ref={ref} />;
  }) as ComponentType<ViewProps>;

  Element.displayName = tag.toLocaleUpperCase();
  return Element;
}

const Nav = styled(createView('nav'))();

export default Nav;

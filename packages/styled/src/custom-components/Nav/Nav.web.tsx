import { type ComponentType, forwardRef, type HTMLElementType } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';

function createView(tag: HTMLElementType): ComponentType<ViewProps> {
  const Element = forwardRef((props: ViewProps, ref: any) => {
    if (Platform.OS === 'web') {
      return unstable_createElement(tag, { ...props, ref });
    }
    return <View {...props} ref={ref} />;
  }) as ComponentType<ViewProps>;

  Element.displayName = String(tag).toLocaleUpperCase();
  return Element;
}

const Nav = createView('nav');

export default Nav;

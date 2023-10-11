import { type ComponentType, forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';

function createView(tag: string): ComponentType<ViewProps> {
  const Element = forwardRef((props: ViewProps, ref: any) => {
    return <View {...props} ref={ref} />;
  }) as ComponentType<ViewProps>;

  Element.displayName = tag.toLocaleUpperCase();
  return Element;
}

const Nav = createView('Nav');

export default Nav;

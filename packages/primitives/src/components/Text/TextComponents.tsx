import { ComponentType, forwardRef, ReactHTML } from 'react';
import { Platform, TextProps } from 'react-native';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
import Text from './Text.primitive';

function createTextComponent(tag: keyof ReactHTML): ComponentType<TextProps> {
  const nativeProps: any = Platform.select({
    web: {
      accessibilityRole: 'text',
    },
    default: {},
  });

  const Element = forwardRef((props: TextProps, ref) => {
    if (Platform.OS === 'web') {
      return unstable_createElement(tag, {
        ...nativeProps,
        ...props,
        style: [props.style],
        ref,
      });
    }
    return <Text {...nativeProps} {...props} style={[props.style]} ref={ref} />;
  }) as ComponentType<TextProps>;

  Element.displayName = tag.toLocaleUpperCase();

  return Element;
}

const PrimitiveSpan = createTextComponent('span');
const PrimitiveP = createTextComponent('p');
const PrimitiveStrong = createTextComponent('strong');
const PrimitiveCode = createTextComponent('code');

export { PrimitiveP, PrimitiveSpan, PrimitiveCode, PrimitiveStrong };

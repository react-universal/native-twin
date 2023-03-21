import { ComponentType, forwardRef, PropsWithChildren } from 'react';
import { Platform, TextProps, View, ViewProps } from 'react-native';
import { styled } from '@universal-labs/styled';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
import Text from '../Text/Text.primitive';

function createUL(): ComponentType<ViewProps> {
  const nativeProps: any = Platform.select({
    web: {
      accessibilityRole: 'list',
    },
    default: {},
  });
  const Element = forwardRef((props: ViewProps, ref) => {
    if (Platform.OS === 'web') {
      return unstable_createElement('ul', {
        ...props,
        ...nativeProps,
        ref,
      });
    }
    return <View {...props} {...nativeProps} ref={ref} />;
  }) as ComponentType<ViewProps>;
  Element.displayName = 'UL';
  return Element;
}

type LIProps = TextProps | ViewProps;

function isTextProps(props: any): props is TextProps {
  // Treat <li></li> as a Text element.
  return typeof props.children === 'string';
}

const PrimitiveUL = createUL();
const PrimitiveLI = forwardRef((props: PropsWithChildren<LIProps>, ref: any) => {
  if (isTextProps(props)) {
    // @ts-expect-error
    const accessibilityRole: LIProps['accessibilityRole'] = Platform.select({
      web: 'listitem',
      default: props.accessibilityRole,
    });
    return <Text {...props} accessibilityRole={accessibilityRole} ref={ref} />;
  }
  // @ts-expect-error
  const accessibilityRole: LIProps['accessibilityRole'] = Platform.select({
    web: 'listitem',
    default: props.accessibilityRole,
  });
  return <View {...props} accessibilityRole={accessibilityRole} ref={ref} />;
}) as ComponentType<LIProps>;

PrimitiveLI.displayName = 'LI';

const UL = styled(PrimitiveUL, {
  baseClassName: 'flex flex-col',
});
const LI = styled(PrimitiveLI, {
  baseClassName: 'flex',
});

export { UL, LI };

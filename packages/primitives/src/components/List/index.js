import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Platform, View } from 'react-native';
import { styled } from '@universal-labs/styled';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
import Text from '../Text/Text.primitive';
function createUL() {
    const nativeProps = Platform.select({
        web: {
            accessibilityRole: 'list',
        },
        default: {},
    });
    const Element = forwardRef((props, ref) => {
        if (Platform.OS === 'web') {
            return unstable_createElement('ul', Object.assign(Object.assign(Object.assign({}, props), nativeProps), { ref }));
        }
        return _jsx(View, Object.assign({}, props, nativeProps, { ref: ref }));
    });
    Element.displayName = 'UL';
    return Element;
}
function isTextProps(props) {
    // Treat <li></li> as a Text element.
    return typeof props.children === 'string';
}
const PrimitiveUL = createUL();
const PrimitiveLI = forwardRef((props, ref) => {
    if (isTextProps(props)) {
        // @ts-expect-error
        const accessibilityRole = Platform.select({
            web: 'listitem',
            default: props.accessibilityRole,
        });
        return _jsx(Text, Object.assign({}, props, { accessibilityRole: accessibilityRole, ref: ref }));
    }
    // @ts-expect-error
    const accessibilityRole = Platform.select({
        web: 'listitem',
        default: props.accessibilityRole,
    });
    return _jsx(View, Object.assign({}, props, { accessibilityRole: accessibilityRole, ref: ref }));
});
PrimitiveLI.displayName = 'LI';
const UL = styled(PrimitiveUL);
const LI = styled(PrimitiveLI);
export { UL, LI };

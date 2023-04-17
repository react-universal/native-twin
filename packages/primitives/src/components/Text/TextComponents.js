import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Platform } from 'react-native';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
import Text from './Text.primitive';
function createTextComponent(tag) {
    const nativeProps = Platform.select({
        web: {
            accessibilityRole: 'text',
        },
        default: {},
    });
    const Element = forwardRef((props, ref) => {
        if (Platform.OS === 'web') {
            return unstable_createElement(tag, Object.assign(Object.assign(Object.assign({}, nativeProps), props), { style: [props.style], ref }));
        }
        return _jsx(Text, Object.assign({}, nativeProps, props, { style: [props.style], ref: ref }));
    });
    Element.displayName = tag.toLocaleUpperCase();
    return Element;
}
const PrimitiveSpan = createTextComponent('span');
const PrimitiveP = createTextComponent('p');
const PrimitiveStrong = createTextComponent('strong');
const PrimitiveCode = createTextComponent('code');
export { PrimitiveP, PrimitiveSpan, PrimitiveCode, PrimitiveStrong };

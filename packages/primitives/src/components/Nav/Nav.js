import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Platform, View } from 'react-native';
import { styled } from '@universal-labs/styled';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
function createView(tag) {
    const Element = forwardRef((props, ref) => {
        if (Platform.OS === 'web') {
            return unstable_createElement(tag, Object.assign(Object.assign({}, props), { ref }));
        }
        return _jsx(View, Object.assign({}, props, { ref: ref }));
    });
    Element.displayName = tag.toLocaleUpperCase();
    return Element;
}
const Nav = styled(createView('nav'));
export default Nav;

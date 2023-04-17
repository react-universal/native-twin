import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Platform } from 'react-native';
import Text from './Text.primitive';
function createHeadingComponent(level) {
    const nativeProps = Platform.select({
        web: {
            accessibilityLevel: level,
        },
        default: {},
    });
    const Element = forwardRef((props, ref) => {
        return (_jsx(Text, Object.assign({}, nativeProps, { accessibilityRole: 'header' }, props, { style: [props.style], ref: ref })));
    });
    Element.displayName = `H${level}`;
    return Element;
}
const PrimitiveH1 = createHeadingComponent(1);
const PrimitiveH2 = createHeadingComponent(2);
const PrimitiveH3 = createHeadingComponent(3);
const PrimitiveH4 = createHeadingComponent(4);
const PrimitiveH5 = createHeadingComponent(5);
const PrimitiveH6 = createHeadingComponent(6);
export { PrimitiveH1, PrimitiveH2, PrimitiveH3, PrimitiveH4, PrimitiveH5, PrimitiveH6 };

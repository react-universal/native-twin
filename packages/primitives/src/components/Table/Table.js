import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import Text from '../Text/Text.primitive';
import { View } from '../View';
import { TableText } from './Table.primitive';
export const Table = forwardRef((props, ref) => {
    // @ts-expect-error
    return _jsx(View, Object.assign({}, props, { ref: ref }));
});
Table.displayName = 'Table';
export const THead = forwardRef((props, ref) => {
    // @ts-expect-error
    return _jsx(View, Object.assign({}, props, { ref: ref }));
});
THead.displayName = 'THead';
export const TBody = forwardRef((props, ref) => {
    // @ts-expect-error
    return _jsx(View, Object.assign({}, props, { ref: ref }));
});
TBody.displayName = 'TBody';
export const TFoot = forwardRef((props, ref) => {
    // @ts-expect-error
    return _jsx(View, Object.assign({}, props, { ref: ref }));
});
TFoot.displayName = 'TFoot';
export const TH = forwardRef((props, ref) => {
    return _jsx(TableText, Object.assign({}, props, { style: [styles.th, props.style], ref: ref }));
});
TH.displayName = 'TH';
export const TR = forwardRef((props, ref) => {
    // @ts-expect-error
    return _jsx(View, Object.assign({}, props, { style: [styles.tr, props.style], ref: ref }));
});
TR.displayName = 'TR';
export const TD = forwardRef((props, ref) => {
    return _jsx(TableText, Object.assign({}, props, { style: [styles.td, props.style], ref: ref }));
});
TD.displayName = 'TD';
export const Caption = forwardRef((props, ref) => {
    return _jsx(Text, Object.assign({}, props, { style: [styles.caption, props.style], ref: ref }));
});
Caption.displayName = 'Caption';
const styles = StyleSheet.create({
    caption: {
        textAlign: 'center',
        fontSize: 16,
    },
    th: {
        textAlign: 'center',
        fontWeight: 'bold',
        flex: 1,
        fontSize: 16,
    },
    tr: {
        flexDirection: 'row',
    },
    td: {
        flex: 1,
        fontSize: 16,
    },
});

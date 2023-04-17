import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { FlatList as NativeFlatList } from 'react-native';
import { styled } from '@universal-labs/styled';
const StyledFlatList = styled(NativeFlatList);
function FlatList(_a) {
    var { className, tw } = _a, props = __rest(_a, ["className", "tw"]);
    // @ts-expect-error
    return _jsx(StyledFlatList, Object.assign({}, props, { className: className, tw: tw }));
}
export { FlatList };

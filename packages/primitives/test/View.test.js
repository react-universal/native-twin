import { jsx as _jsx } from "react/jsx-runtime";
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import { Span, View } from '../src';
function toJson(component) {
    const result = component.toJSON();
    expect(result).toBeDefined();
    expect(result).not.toBeInstanceOf(Array);
    return result;
}
describe('@universal-labs/primitives', () => {
    it('View render', () => {
        const component = renderer.create(_jsx(View, Object.assign({ className: 'flex-1' }, { children: _jsx(Span, { children: "Test View" }) })));
        let tree = toJson(component);
        expect(tree).toMatchSnapshot();
    });
});

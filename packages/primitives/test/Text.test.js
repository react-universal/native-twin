import { jsx as _jsx } from "react/jsx-runtime";
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import { H1 } from '../src';
function toJson(component) {
    const result = component.toJSON();
    expect(result).toBeDefined();
    expect(result).not.toBeInstanceOf(Array);
    return result;
}
describe('@universal-labs/primitives', () => {
    it('H1 render', () => {
        const component = renderer.create(_jsx(H1, Object.assign({ className: 'text-sm' }, { children: "Test H1" })));
        let tree = toJson(component);
        expect(tree).toMatchSnapshot();
    });
});

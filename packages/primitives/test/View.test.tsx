import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import { Span, View } from '../src';

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

describe('@universal-labs/primitives', () => {
  it('View render', () => {
    const component = renderer.create(
      <View className='flex-1'>
        <Span>Test View</Span>
      </View>,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

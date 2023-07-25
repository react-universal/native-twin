import { View } from 'react-native';
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import styledComponents from '../src';

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

const StyledView = styledComponents(View)``;

describe('@universal-labs/styled', () => {
  it('StyledView render', () => {
    const component = renderer.create(<StyledView className='flex-1' />);
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

const CustomView = styledComponents.View``;

describe('@universal-labs/styled', () => {
  it('CustomView render', () => {
    const component = renderer.create(<CustomView className='flex-1' />);
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

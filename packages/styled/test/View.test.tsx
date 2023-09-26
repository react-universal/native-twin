import { View } from 'react-native';
import { createTailwind } from '@universal-labs/native-tailwind';
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import styledComponents from '../src';

createTailwind({});

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

const CustomView = styledComponents.View`rotate-6 translate-x-4`;

describe('@universal-labs/styled', () => {
  it('CustomView render', () => {
    const component = renderer.create(<CustomView className='flex-1' />);
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

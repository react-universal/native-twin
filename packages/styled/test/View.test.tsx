import { defineConfig, setup } from '@universal-labs/native-twin';
import { presetTailwind } from '@universal-labs/preset-tailwind';
import renderer from 'react-test-renderer';
import { beforeAll, describe, expect, it } from 'vitest';
import { View as StyledView } from '../src';

beforeAll(() => {
  setup(defineConfig({ presets: [presetTailwind()] }));
});

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

describe('@universal-labs/styled', () => {
  it('StyledView render', () => {
    const component = renderer.create(<StyledView className='flex-1' />);
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

describe('@universal-labs/styled', () => {
  it('CustomView render', () => {
    const component = renderer.create(
      <StyledView className='shadow-sm web:p-10 sm:p-10 flex-1' />,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

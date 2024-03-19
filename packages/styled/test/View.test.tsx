import renderer from 'react-test-renderer';
import { defineConfig, setup } from '@native-twin/native-twin';
import { presetTailwind } from '@native-twin/preset-tailwind';
import { View as StyledView, Text } from '../src';

beforeAll(() => {
  setup(defineConfig({ presets: [presetTailwind()] }));
});

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

describe('@native-twin/styled', () => {
  it('StyledView render', () => {
    const component = renderer.create(<StyledView className='flex-1' />);
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

describe('@native-twin/styled', () => {
  it('CustomView render', () => {
    const component = renderer.create(
      <StyledView className='shadow-sm web:p-10 sm:p-10 flex-1 outline-none'>
        <Text className='leading-6'>asd</Text>
      </StyledView>,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

import { defineConfig, setup } from '@universal-labs/native-twin';
import { presetTailwind } from '@universal-labs/preset-tailwind';
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import styledComponents from '../src';

setup(defineConfig({ presets: [presetTailwind()] }));

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

const ScrollView = styledComponents.ScrollView.variants({
  variants: {
    intent: { primary: '', sec: '' },
  },
});
describe('@universal-labs/styled', () => {
  it('ScrollView render', () => {
    const component = renderer.create(
      <ScrollView className='flex-1'>
        <View />
      </ScrollView>,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

const View = styledComponents.View.variants({
  base: `
    flex-1
    hover:(bg-blue-600)
    p-14 bg-rose-200 border-white border-2
    items-center justify-center md:border-3
  `,
  variants: {
    intent: {
      primary: '',
      secondary: 'm-2',
      third: '',
    },
    active: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    active: true,
  },
});
const H1 = styledComponents.Text`
  text(center 2xl indigo-600)
  hover:text-gray-700
`;

describe('@universal-labs/styled', () => {
  it('Complex View', () => {
    const component = renderer.create(
      <View intent='secondary'>
        <H1>H1 - 1</H1>
      </View>,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
